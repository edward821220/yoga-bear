import React, { useState, useContext } from "react";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
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
import { collection, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { AuthContext } from "../context/authContext";

const resourcesData = [
  {
    text: "初學者",
    id: 1,
    color: "#105861",
  },
  {
    text: "一般練習者",
    id: 2,
    color: "#c76035",
  },
  {
    text: "進階練習者",
    id: 3,
    color: "#cb4641",
  },
];

const resources = [
  {
    fieldName: "Level",
    title: "Level",
    instances: resourcesData,
  },
];

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
        placeholder="請輸入課程內容"
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

export default function TeacherCalendar() {
  const [data, setData] = useState<AppointmentModel[]>([]);
  const [view, setView] = useState("Month");
  const { userData } = useContext(AuthContext);
  console.log(data);
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
          <AppointmentTooltip showOpenButton showDeleteButton />
          <ConfirmationDialog />
          <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
          <Resources data={resources} mainResourceName="Level" />
          <AllDayPanel />
        </Scheduler>
      </Paper>
    </>
  );
}
