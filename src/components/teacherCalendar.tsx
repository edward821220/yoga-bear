import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
  ChangeSet,
  AppointmentModel,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  MonthView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";

const appointments: Array<AppointmentModel> = [];

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
      <AppointmentForm.Label text="Custom Field" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.customField}
        onValueChange={onCustomFieldChange}
        placeholder="Custom field"
        type="titleTextEditor"
        readOnly
      />
    </AppointmentForm.BasicLayout>
  );
}
const currenDate = new Date(Date.now()).toLocaleString().split(" ")[0].replaceAll("/", "-");

export default function TeacherCalendar() {
  const [data, setData] = useState<AppointmentModel[]>(appointments);
  const [currentDate, setCurrentDate] = useState<string>();
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
    <Paper>
      <Scheduler data={data}>
        <ViewState currentDate={currentDate} />
        <EditingState onCommitChanges={commitChanges} />
        <IntegratedEditing />
        {/* <MonthView /> */}
        <WeekView startDayHour={8} endDayHour={22} />
        <Appointments />
        <AppointmentTooltip showOpenButton showDeleteButton />
        <ConfirmationDialog />
        <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
      </Scheduler>
    </Paper>
  );
}
