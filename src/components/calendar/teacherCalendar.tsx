import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "../../contexts/authContext";
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

const currentDate = new Date(Date.now()).toLocaleString().split(" ")[0].replaceAll("/", "-");

function CommandButton({ ...restProps }) {
  const router = useRouter();
  return (
    <>
      <AppointmentTooltip.CommandButton {...restProps} />
      <RoomButtonWrapper>
        <Image
          src={RoomButton}
          alt="room-btn"
          width={30}
          onClick={() => {
            router.push("/myCourses/classRoom/teacherRoom/01");
          }}
        />
      </RoomButtonWrapper>
    </>
  );
}

export default function TeacherCalendar() {
  const [data, setData] = useState<AppointmentModel[]>([]);
  const [view, setView] = useState("Month");
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const getRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("teacherId", "==", userData.uid));
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
  }, [userData.uid]);

  const commitChanges = ({ added, changed, deleted }: ChangeSet): void => {
    if (added) {
      const newRoomRef = doc(collection(db, "rooms"));
      setData([...data, { id: newRoomRef.id, startDate: added.startDate, ...added }]);
      setDoc(newRoomRef, { id: newRoomRef.id, startDate: added.startDate, teacherId: userData.uid, ...added });
    }
    if (changed) {
      setData(
        data.map((appointment) => {
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
      setData(data.filter((appointment) => appointment.id !== deleted));
      if (typeof deleted !== "string") return;
      deleteDoc(doc(db, "rooms", deleted));
    }
  };
  return (
    <>
      <ExternalViewSwitcher
        currentViewName={view}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          setView(e.target.value);
        }}
      />
      <Paper>
        <Scheduler data={data} height={600}>
          <ViewState currentDate={currentDate} currentViewName={view} />
          <EditingState onCommitChanges={commitChanges} />
          <IntegratedEditing />
          <MonthView />
          <WeekView startDayHour={8} endDayHour={22} />
          <Appointments />
          <AppointmentTooltip commandButtonComponent={CommandButton} showOpenButton />
          <ConfirmationDialog />
          <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
          <Resources data={resources} mainResourceName="Level" />
          <AllDayPanel />
        </Scheduler>
      </Paper>
    </>
  );
}
