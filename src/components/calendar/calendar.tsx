import { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Image from "next/image";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
  ChangeSet,
  AppointmentModel,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Resources,
  WeekView,
  MonthView,
  Toolbar,
  DragDropProvider,
  DateNavigator,
  TodayButton,
  AllDayPanel,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import { bearMoneyState } from "../../utils/recoil";
import Modal from "../modal";
import RoomButton from "../../../public/room.png";
import ReserveButton from "../../../public/reserve.png";
import ReviewButton from "../../../public/review.png";
import EmptyStar from "../../../public/star-empty.png";
import Star from "../../../public/star.png";
import ContentButton from "../../../public/content.png";
import ClassDetailModal from "./classDetailModal";
import resources from "./resources";

const SwitcherWrapper = styled.div`
  padding: 5px 0 0 10px;
`;
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

const ReserveButtonWrapper = styled.div`
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
const RoomButtonWrapper = styled.div`
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

function TextEditor(props: AppointmentForm.TextEditorProps) {
  const { type } = props;
  if (type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function TeacherLayout({ onFieldChange, appointmentData, ...restProps }: AppointmentForm.BasicLayoutProps) {
  const onMaximumChange = (nextValue: string) => {
    onFieldChange({ maximum: nextValue });
  };
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
      <AppointmentForm.Label text="????????????" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.maximum as string}
        onValueChange={onMaximumChange}
        placeholder="?????????????????????"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="????????????" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.price as string}
        onValueChange={onPriceChange}
        placeholder="?????????????????????"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="????????????" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.description as string}
        onValueChange={onDescriptionChange}
        placeholder="???????????????????????????????????????????????????????????????"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="????????????" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.precaution as string}
        onValueChange={onPrecautionChange}
        placeholder="?????????????????????"
        type="ordinaryTextEditor"
        readOnly={false}
      />
    </AppointmentForm.BasicLayout>
  );
}

function ExternalViewSwitcher({
  currentViewName,
  onChange,
}: {
  currentViewName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <RadioGroup
      aria-label="Views"
      style={{ flexDirection: "row" }}
      name="views"
      value={currentViewName}
      onChange={onChange}
    >
      <FormControlLabel value="Week" control={<Radio />} label="Week" />
      <FormControlLabel value="Month" control={<Radio />} label="Month" />
    </RadioGroup>
  );
}

function TeacherHeader({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const router = useRouter();
  const isEnded = Date.now() > Date.parse(appointmentData?.endDate as string);

  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      {isEnded || (
        <RoomButtonWrapper>
          <Image
            src={RoomButton}
            alt="room-btn"
            width={30}
            onClick={() => {
              if (!appointmentData || typeof appointmentData.id !== "string") return;
              router.push(`/myCourses/classRoom/videoChatRoom/${appointmentData.id}`);
            }}
          />
        </RoomButtonWrapper>
      )}
    </AppointmentTooltip.Header>
  );
}
function StudentHeader({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showClassDetailModal, setShowClassDetailModal] = useState(false);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");
  const { userData } = useContext(AuthContext);
  const isEnded = Date.now() > Date.parse(appointmentData?.endDate as string);

  const handleCloseDetail = () => {
    setShowClassDetailModal(false);
  };
  const handleCloseReview = () => {
    setScore(0);
    setComments("");
    setShowReviewModal(false);
  };

  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      <ButtonWrapper>
        <Image
          src={ContentButton}
          alt="content-btn"
          width={30}
          onClick={() => {
            setShowClassDetailModal(true);
          }}
        />
      </ButtonWrapper>
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
      {showClassDetailModal && <ClassDetailModal handleClose={handleCloseDetail} appointmentData={appointmentData} />}
      {showReviewModal && (
        <Modal handleClose={handleCloseReview}>
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
                placeholder="??????????????????"
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
                  Swal.fire({ title: "?????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
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
                  text: "????????????????????????????????????????????????????????????",
                  confirmButtonColor: "#5d7262",
                  icon: "success",
                });
                setComments("");
                setScore(0);
                setShowReviewModal(false);
              }}
            >
              ??????
            </Button>
          </ReviewForm>
        </Modal>
      )}
    </AppointmentTooltip.Header>
  );
}

function ReserveHeader({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const { userData } = useContext(AuthContext);
  const { email } = userData;
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);
  const [showClassDetailModal, setShowClassDetailModal] = useState(false);

  const isEnded = Date.now() > Date.parse(appointmentData?.endDate as string);
  const maximum = Number(appointmentData?.maximum) || 1;
  const handleCloseDetail = () => {
    setShowClassDetailModal(false);
  };
  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      <ButtonWrapper>
        <Image
          src={ContentButton}
          alt="content-btn"
          width={30}
          onClick={() => {
            setShowClassDetailModal(true);
          }}
        />
      </ButtonWrapper>
      {isEnded || (
        <ReserveButtonWrapper>
          <Image
            src={ReserveButton}
            alt="reserve-btn"
            width={36}
            onClick={() => {
              if (!appointmentData) return;
              const price = Number(appointmentData.price as string) || 0;
              Swal.fire({
                text: `?????????????????????????????? ${price} ?????????`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes!",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const roomRef = doc(db, "rooms", appointmentData.id as string);
                  const res = await getDoc(roomRef);
                  const data = res.data();
                  const students = data?.students as string[];
                  if (students?.includes(email)) {
                    Swal.fire({
                      title: "????????????????????????????????????",
                      confirmButtonColor: "#5d7262",
                      icon: "warning",
                    });
                    return;
                  }
                  if (students?.length === maximum) {
                    Swal.fire({
                      title: "??????????????????????????????????????????",
                      confirmButtonColor: "#5d7262",
                      icon: "warning",
                    });
                    return;
                  }
                  updateDoc(roomRef, {
                    students: arrayUnion(email),
                  });
                  if (price > bearMoney) {
                    Swal.fire({ title: "????????????????????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
                    return;
                  }
                  setBearMoney((prev) => prev - price);
                  const docRef = doc(db, "users", userData.uid);
                  updateDoc(docRef, {
                    cartItems: [],
                    bearMoney: bearMoney - price,
                  });
                  Swal.fire("?????????????????????", "??????????????????????????????", "success");
                  const templateParams = {
                    email: userData.email,
                    name: userData.username,
                    class: appointmentData.title,
                    price,
                    start: appointmentData.startDate,
                    end: appointmentData.endDate,
                  };
                  emailjs.send("service_b8k8uuv", "template_yhdbjcn", templateParams, "ZY0JeIuS-PmILJZtR");
                }
              });
            }}
          />
        </ReserveButtonWrapper>
      )}
      {showClassDetailModal && <ClassDetailModal handleClose={handleCloseDetail} appointmentData={appointmentData} />}
    </AppointmentTooltip.Header>
  );
}

interface ICalendarProps {
  category: string;
  userData?: { uid: string; username: string; email: string };
  teacherId?: string;
}
export default function Calendar({ category, userData, teacherId }: ICalendarProps) {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
  const [view, setView] = useState("Week");
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
    if (!userData) return;
    const getTeacherRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("teacherId", "==", userData.uid));
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
    const getStudentRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("students", "array-contains", userData.email));
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
    const getReserveRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("teacherId", "==", teacherId));
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
    if (category === "teacherCalendar") getTeacherRooms();
    if (category === "studentCalendar") getStudentRooms();
    if (category === "reserveCalendar") getReserveRooms();
  }, [userData, category, teacherId]);

  const commitChanges = ({ added, changed, deleted }: ChangeSet): void => {
    if (!userData) return;
    if (added) {
      const newRoomRef = doc(collection(db, "rooms"));
      setAppointments([...appointments, { id: newRoomRef.id, startDate: added.startDate as number, ...added }]);
      setDoc(newRoomRef, {
        id: newRoomRef.id,
        startDate: added.startDate as number,
        teacherId: userData.uid,
        teacherName: userData.username,
        ...added,
      });
    }
    if (changed) {
      setAppointments(
        appointments.map((appointment) => {
          if (appointment.id === undefined) return;
          if (changed[appointment.id] && typeof appointment.id === "string") {
            const roomRef = doc(db, "rooms", appointment.id);
            updateDoc(roomRef, {
              ...changed[appointment.id],
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment;
        })
      );
    }
    if (deleted !== undefined) {
      setAppointments(appointments.filter((appointment) => appointment.id !== deleted));
      if (typeof deleted !== "string") return;
      deleteDoc(doc(db, "rooms", deleted));
    }
  };
  return (
    <>
      {category === "teacherCalendar" && (
        <SwitcherWrapper>
          <ExternalViewSwitcher
            currentViewName={view}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setView(e.target.value);
            }}
          />
        </SwitcherWrapper>
      )}
      <Paper>
        <Scheduler data={appointments} height={600}>
          <ViewState
            currentDate={currentDate}
            currentViewName={view}
            onCurrentDateChange={setCurrentDate as (currentDate: Date) => void}
          />
          <EditingState onCommitChanges={category === "teacherCalendar" ? commitChanges : () => {}} />
          <IntegratedEditing />
          <MonthView />
          <WeekView startDayHour={8} endDayHour={22} />
          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <Appointments />
          {category === "teacherCalendar" && <AppointmentTooltip headerComponent={TeacherHeader} showOpenButton />}
          {category === "studentCalendar" && <AppointmentTooltip headerComponent={StudentHeader} />}
          {category === "reserveCalendar" && <AppointmentTooltip headerComponent={ReserveHeader} />}
          <ConfirmationDialog />
          {category === "teacherCalendar" && (
            <AppointmentForm basicLayoutComponent={TeacherLayout} textEditorComponent={TextEditor} />
          )}
          <Resources data={resources} mainResourceName="????????????" />
          <AllDayPanel />
          {category === "teacherCalendar" && <DragDropProvider />}
        </Scheduler>
      </Paper>
    </>
  );
}

Calendar.defaultProps = {
  userData: { uid: "", username: "", email: "" },
  teacherId: "",
};
