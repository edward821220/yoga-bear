import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ViewState, EditingState, IntegratedEditing } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  MonthView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";

const appointments = [
  {
    title: "Website Re-Design Plan",
    startDate: new Date(2022, 10, 2, 9, 30),
    endDate: new Date(2022, 10, 2, 11, 30),
    id: 0,
    location: "Room 1",
  },
];

interface ViewSwitcherProps {
  currentViewName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function TextEditor(props: any) {
  /*  eslint-disable @typescript-eslint/no-unsafe-member-access */
  /*  eslint-disable react/destructuring-assignment */
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function BasicLayout({ onFieldChange, appointmentData, ...restProps }: { onFieldChange: any; appointmentData: any }) {
  const onCustomFieldChange = (nextValue: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    onFieldChange({ customField: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout appointmentData={appointmentData} onFieldChange={onFieldChange} {...restProps}>
      <AppointmentForm.Label text="Custom Field" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.customField}
        onValueChange={onCustomFieldChange}
        placeholder="Custom field"
      />
    </AppointmentForm.BasicLayout>
  );
}

function ExternalViewSwitcher({ currentViewName, onChange }: ViewSwitcherProps) {
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
  const [data, setData] = useState(appointments);
  const [view, setView] = useState("Month");

  const commitChanges = ({ added, changed, deleted }: { added: any; changed: any; deleted: any }) => {
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
      setData([...data, { id: startingAddedId, ...added }]);
    }
    if (changed) {
      setData(
        data.map((appointment) => {
          if (!appointment.id) return;
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setView(e.target.value);
        }}
      />
      <Paper>
        <Scheduler data={data} height={660}>
          <ViewState defaultCurrentDate={currentDate} currentViewName={view} />
          <EditingState onCommitChanges={commitChanges} />
          <IntegratedEditing />
          <WeekView startDayHour={7} endDayHour={22} />
          <MonthView />
          <Appointments />
          <AppointmentTooltip showCloseButton showOpenButton />
          <ConfirmationDialog />
          <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
        </Scheduler>
      </Paper>
    </>
  );
}
