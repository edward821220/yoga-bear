import React, { useState, useEffect } from "react";
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
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import styled from "styled-components";
import { useRouter } from "next/router";
import { db } from "../../../lib/firebase";

import RoomButton from "../../../public/room.png";
import resources from "./resources";

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
const SwitcherWrapper = styled.div`
  padding: 5px 0 0 10px;
`;

function TextEditor(props: AppointmentForm.TextEditorProps) {
  const { type } = props;
  if (type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function BasicLayout({ onFieldChange, appointmentData, ...restProps }: AppointmentForm.BasicLayoutProps) {
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
      <AppointmentForm.Label text="課程人數" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.maximum}
        onValueChange={onMaximumChange}
        placeholder="請輸入人數上限"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="課程價格" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.price}
        onValueChange={onPriceChange}
        placeholder="請輸入課程價格"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="課程說明" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.description}
        onValueChange={onDescriptionChange}
        placeholder="請輸入課程內容（若是實體課請填寫上課地點）"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="注意事項" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.precaution}
        onValueChange={onPrecautionChange}
        placeholder="請輸入注意事項"
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

function Header({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
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

export default function TeacherCalendar({ uid, name }: { uid: string; name: string }) {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
  const [view, setView] = useState("Week");
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
    const getRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("teacherId", "==", uid));
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
  }, [uid]);

  const commitChanges = ({ added, changed, deleted }: ChangeSet): void => {
    if (added) {
      const newRoomRef = doc(collection(db, "rooms"));
      setAppointments([...appointments, { id: newRoomRef.id, startDate: added.startDate, ...added }]);
      setDoc(newRoomRef, {
        id: newRoomRef.id,
        startDate: added.startDate,
        teacherId: uid,
        teacherName: name,
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
      <SwitcherWrapper>
        <ExternalViewSwitcher
          currentViewName={view}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            setView(e.target.value);
          }}
        />
      </SwitcherWrapper>
      <Paper>
        <Scheduler data={appointments} height={600}>
          <ViewState
            currentDate={currentDate}
            currentViewName={view}
            onCurrentDateChange={setCurrentDate as (currentDate: Date) => void}
          />
          <EditingState onCommitChanges={commitChanges} />
          <IntegratedEditing />
          <MonthView />
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
          <DragDropProvider />
        </Scheduler>
      </Paper>
    </>
  );
}
