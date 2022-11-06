import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import { useRouter } from "next/router";
import { ViewState, EditingState, IntegratedEditing, AppointmentModel } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Resources,
  WeekView,
  AllDayPanel,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import { collection, getDocs, query, where } from "firebase/firestore";
import styled from "styled-components";
import { db } from "../../../../lib/firebase";
import resources from "../../../components/calendar/resources";

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 0;
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

const currentDate = new Date(Date.now()).toLocaleString().split(" ")[0].replaceAll("/", "-");

export default function TeacherCalendar() {
  const [data, setData] = useState<AppointmentModel[]>([]);
  const router = useRouter();
  const { teacherId } = router.query;

  useEffect(() => {
    if (!teacherId) return;
    const getRooms = async () => {
      const courseRef = collection(db, "rooms");
      const courseQuery = query(courseRef, where("teacherId", "==", teacherId));
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
  }, [teacherId]);

  return (
    <Wrapper>
      <Paper>
        <Scheduler data={data} height={600}>
          <ViewState currentDate={currentDate} currentViewName="Week" />
          <EditingState onCommitChanges={() => {}} />
          <IntegratedEditing />
          <WeekView startDayHour={8} endDayHour={22} />
          <Appointments />
          <AppointmentTooltip showOpenButton />
          <ConfirmationDialog />
          <AppointmentForm basicLayoutComponent={BasicLayout} textEditorComponent={TextEditor} />
          <Resources data={resources} mainResourceName="Level" />
          <AllDayPanel />
        </Scheduler>
      </Paper>
    </Wrapper>
  );
}
