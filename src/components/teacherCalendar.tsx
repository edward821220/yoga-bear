import * as React from "react";
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
  MonthView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";

const appointments: Array<AppointmentModel> = [
  {
    title: "Website Re-Design Plan",
    startDate: new Date(2022, 10, 2, 9, 30),
    endDate: new Date(2022, 10, 2, 11, 30),
    id: 0,
    location: "Room 1",
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

interface State {
  data: Array<AppointmentModel>;
  currentDate: string;
}

export default class TeacherCalendar extends React.PureComponent<Array<AppointmentModel>, State> {
  constructor(props: Array<AppointmentModel>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(props);
    this.state = {
      data: appointments,
      currentDate: new Date(Date.now()).toLocaleString().split(" ")[0].replaceAll("/", "-"),
    };

    this.commitChanges = this.commitChanges.bind(this);
  }

  commitChanges({ added, changed, deleted }: ChangeSet): void {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId = data.length > 0 ? Number(data[data.length - 1].id) + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map((appointment) => {
          if (appointment.id === undefined) return;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment;
        });
      }
      if (deleted !== undefined) {
        data = data.filter((appointment) => appointment.id !== deleted);
      }
      return { data };
    });
  }

  render() {
    const { currentDate, data } = this.state;

    return (
      <Paper>
        <Scheduler data={data}>
          <ViewState currentDate={currentDate} />
          <EditingState onCommitChanges={this.commitChanges} />
          <IntegratedEditing />
          <MonthView />
          <Appointments />
          <AppointmentTooltip showOpenButton showDeleteButton />
          <ConfirmationDialog />
          <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
        </Scheduler>
      </Paper>
    );
  }
}
