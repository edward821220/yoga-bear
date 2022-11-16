import React, { useState, useEffect, useContext } from "react";
import Paper from "@mui/material/Paper";
import Image from "next/image";
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
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color3};
  border-radius: 5px;
  width: 100px;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
`;

function TextEditor(props: AppointmentForm.TextEditorProps) {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function BasicLayout({ onFieldChange, appointmentData, ...restProps }: AppointmentForm.BasicLayoutProps) {
  const onDescriptionChange = (nextValue: string) => {
    onFieldChange({ description: nextValue });
  };
  const onPriceChange = (nextValue: string) => {
    onFieldChange({ price: nextValue });
  };
  const onPrecautionChange = (nextValue: string) => {
    onFieldChange({ precaution: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout appointmentData={appointmentData} onFieldChange={onFieldChange} {...restProps}>
      <AppointmentForm.Label text="課程說明" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.description}
        onValueChange={onDescriptionChange}
        placeholder="請輸入課程內容（若是實體課請填寫上課地點）"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="課程價格" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.price}
        onValueChange={onPriceChange}
        placeholder="請輸入課程價格"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="注意事項" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.precaution}
        onValueChange={onPrecautionChange}
        placeholder="請輸入注意事項"
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
              router.push(`/myCourses/classRoom/studentRoom/${appointmentData.id}`);
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
                  alert("請點選星星評分");
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
                alert("感謝您的評論～您的支持是我們最大的動力！");
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
  const [data, setData] = useState<AppointmentModel[]>([]);
  const { uid, username, email } = userData;
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
    const getRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("students", "array-contains", { username, email }));
      const querySnapshot = await getDocs(courseQuery);
      const results: AppointmentModel[] = [];
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      querySnapshot.forEach((datas) => {
        results.push({
          ...datas.data(),
          startDate: new Date(datas.data().startDate.seconds * 1000),
          endDate: new Date(datas.data().endDate.seconds * 1000),
        });
      });
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      setData(results);
    };
    getRooms();
  }, [uid, username, email]);

  return (
    <Paper>
      <Scheduler data={data} height={600}>
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
        <Resources data={resources} mainResourceName="Level" />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
}

export default StudentCalendar;
