import React, { useState, useEffect, useContext } from "react";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import Swal from "sweetalert2";
import { ViewState, EditingState, IntegratedEditing, AppointmentModel } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Resources,
  WeekView,
  Toolbar,
  DateNavigator,
  TodayButton,
  AllDayPanel,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import { collection, doc, updateDoc, getDocs, query, where, arrayUnion } from "firebase/firestore";
import styled from "styled-components";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/authContext";
import { db } from "../../../lib/firebase";
import Modal from "../modal";
import resources from "./resources";
import RoomButton from "../../../public/room.png";
import ReviewButton from "../../../public/review.png";
import EmptyStar from "../../../public/star-empty.png";
import Star from "../../../public/star.png";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: 1px solid transparent;
  border-radius: 50%;
  margin-right: 10px;
  margin-left: 5px;
  cursor: pointer;
  &:hover {
    background-color: #eeeeee;
  }
`;
const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${(props) => props.theme.colors.color2};
`;
const ReviewLabel = styled.label`
  display: flex;
  margin-bottom: 20px;
`;
const ReviewTextarea = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
  margin-bottom: 20px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  width: 100px;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
`;

function TextEditor(props: AppointmentForm.TextEditorProps) {
  const { type } = props;
  if (type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function BasicLayout({ onFieldChange, appointmentData, ...restProps }: AppointmentForm.BasicLayoutProps) {
  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
      readOnly
    >
      <AppointmentForm.Label text="課程人數" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.maximum}
        onValueChange={() => {}}
        placeholder="請輸入人數上限"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="課程價格" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.price}
        onValueChange={() => {}}
        placeholder="請輸入課程價格"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="課程說明" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.description}
        onValueChange={() => {}}
        placeholder="請輸入課程內容（若是實體課請填寫上課地點）"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="注意事項" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.precaution}
        onValueChange={() => {}}
        placeholder="請輸入注意事項"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="開課老師" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.teacherName}
        onValueChange={() => {}}
        placeholder="開課老師"
        type="ordinaryTextEditor"
        readOnly
      />
    </AppointmentForm.BasicLayout>
  );
}

function Header({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");
  const { userData } = useContext(AuthContext);
  const isEnded = Date.now() > Date.parse(appointmentData?.endDate as string);
  const handleClose = () => {
    setScore(0);
    setComments("");
    setShowReviewModal(false);
  };

  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      {isEnded || (
        <ButtonWrapper>
          <Image
            src={RoomButton}
            alt="room-btn"
            width={30}
            onClick={() => {
              if (!appointmentData || typeof appointmentData.id !== "string") return;
              router.push(`/myCourses/classRoom/videoChatRoom/${appointmentData.id}`);
            }}
          />
        </ButtonWrapper>
      )}
      {/* eslint-disable @typescript-eslint/no-unsafe-call */}
      {/* eslint-disable @typescript-eslint/no-unsafe-member-access */}
      {isEnded && !appointmentData?.reviewedStudents?.includes(userData.uid) && (
        <ButtonWrapper>
          <Image
            src={ReviewButton}
            alt="review-btn"
            width={26}
            onClick={() => {
              setShowReviewModal(true);
            }}
          />
        </ButtonWrapper>
      )}
      {showReviewModal && (
        <Modal handleClose={handleClose}>
          <ReviewForm>
            <ReviewLabel>
              {Array.from({ length: 5 }, (v, i) => i + 1).map((starIndex) => (
                <StarWrapper
                  key={starIndex}
                  onClick={() => {
                    setScore(starIndex);
                  }}
                >
                  {score >= starIndex ? (
                    <Image src={Star} alt="star" fill sizes="contain" />
                  ) : (
                    <Image src={EmptyStar} alt="empty-star" fill sizes="contain" />
                  )}
                </StarWrapper>
              ))}
            </ReviewLabel>
            <ReviewLabel>
              <ReviewTextarea
                placeholder="留下您的評價"
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                }}
              />
            </ReviewLabel>
            <Button
              type="button"
              onClick={async () => {
                if (score === 0) {
                  Swal.fire({ title: "請點選星星評分", confirmButtonColor: "#5d7262", icon: "warning" });
                  return;
                }
                if (!appointmentData || typeof appointmentData.teacherId !== "string") return;
                const teacherRef = doc(db, "users", appointmentData.teacherId);
                await updateDoc(teacherRef, {
                  reviews: arrayUnion({
                    userId: userData.uid,
                    score,
                    comments,
                    class: appointmentData.title,
                  }),
                });
                if (typeof appointmentData.id !== "string") return;
                const roomRef = doc(db, "rooms", appointmentData.id);
                await updateDoc(roomRef, {
                  reviewedStudents: arrayUnion(userData.uid),
                });
                Swal.fire({
                  text: "感謝您的評論～您的支持是我們最大的動力！",
                  confirmButtonColor: "#5d7262",
                  icon: "success",
                });
                setComments("");
                setScore(0);
                setShowReviewModal(false);
              }}
            >
              送出
            </Button>
          </ReviewForm>
        </Modal>
      )}
    </AppointmentTooltip.Header>
  );
}

function StudentCalendar({ userData }: { userData: { uid: string; username: string; email: string } }) {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
  const { uid, username, email } = userData;
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
    const getRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("students", "array-contains", email));
      const querySnapshot = await getDocs(courseQuery);
      const results: AppointmentModel[] = [];
      querySnapshot.forEach((data) => {
        const startDate = data.data().startDate as { seconds: number };
        const endDate = data.data().endDate as { seconds: number };
        results.push({
          ...data.data(),
          startDate: new Date(startDate.seconds * 1000),
          endDate: new Date(endDate.seconds * 1000),
        });
      });
      setAppointments(results);
    };
    getRooms();
  }, [uid, username, email]);

  return (
    <Paper>
      <Scheduler data={appointments} height={600}>
        <ViewState
          currentDate={currentDate}
          currentViewName="Week"
          onCurrentDateChange={setCurrentDate as (currentDate: Date) => void}
        />
        <EditingState onCommitChanges={() => {}} />
        <IntegratedEditing />
        <WeekView startDayHour={8} endDayHour={22} />
        <Toolbar />
        <DateNavigator />
        <TodayButton />
        <Appointments />
        <AppointmentTooltip headerComponent={Header} showOpenButton />
        <ConfirmationDialog />
        <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
        <Resources data={resources} mainResourceName="課程難度" />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
}

export default StudentCalendar;
