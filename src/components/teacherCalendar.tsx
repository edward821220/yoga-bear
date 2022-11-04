import React, { useState } from "react";
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
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCustomFieldChange = (nextValue: any) => {
    onFieldChange({ customField: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout appointmentData={appointmentData} onFieldChange={onFieldChange} {...restProps}>
      <AppointmentForm.Label text="課程說明" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.customField}
        onValueChange={onCustomFieldChange}
        placeholder="請輸入課程內容"
        type="ordinaryTextEditor"
        readOnly={false}
      />
      <AppointmentForm.Label text="注意事項" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.customField}
        onValueChange={onCustomFieldChange}
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

  const commitChanges = ({ added, changed, deleted }: ChangeSet): void => {
    if (added) {
      const startingAddedId = data.length > 0 ? Number(data[data.length - 1].id) + 1 : 0;
      setData([...data, { id: startingAddedId, startDate: added.startDate, ...added }]);
    }
    if (changed) {
      setData(
        data.map((appointment) => {
          if (appointment.id === undefined) return;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment;
        })
      );
    }
    if (deleted !== undefined) {
      setData(data.filter((appointment) => appointment.id !== deleted));
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
        <Scheduler data={data} height={400}>
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
        </Scheduler>
      </Paper>
    </>
  );
}
