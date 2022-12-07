import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
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
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useRecoilState } from "recoil";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import { bearMoneyState } from "../../pages/utils/recoil";
import resources from "./resources";
import ReserveButton from "../../../public/reserve.png";

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

function TextEditor(props: AppointmentForm.TextEditorProps) {
  const { type } = props;
  if (type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
}

function BasicLayout({ onFieldChange, appointmentData, ...restProps }: AppointmentForm.BasicLayoutProps) {
  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
      readOnly
    >
      <AppointmentForm.Label text="課程人數" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={Number(appointmentData.maximum) || 1}
        onValueChange={() => {}}
        placeholder="請輸入人數上限"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="課程價格" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={Number(appointmentData.price) || 0}
        onValueChange={() => {}}
        placeholder="請輸入課程價格"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="課程說明" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.description as string}
        onValueChange={() => {}}
        placeholder="請輸入課程內容（若是實體課請填寫上課地點）"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="注意事項" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.precaution as string}
        onValueChange={() => {}}
        placeholder="請輸入注意事項"
        type="ordinaryTextEditor"
        readOnly
      />
      <AppointmentForm.Label text="開課老師" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.teacherName as string}
        onValueChange={() => {}}
        placeholder="開課老師"
        type="ordinaryTextEditor"
        readOnly
      />
    </AppointmentForm.BasicLayout>
  );
}

function Header({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const { userData } = useContext(AuthContext);
  const { email } = userData;
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);
  const isEnded = Date.now() > Date.parse(appointmentData?.endDate as string);
  const maximum = Number(appointmentData?.maximum) || 1;
  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
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
                text: `確定要預約嗎？將扣除 ${price} 元熊幣`,
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
                      title: "您已經預約過這個課程囉～",
                      confirmButtonColor: "#5d7262",
                      icon: "warning",
                    });
                    return;
                  }
                  if (students?.length === maximum) {
                    Swal.fire({
                      title: "人數滿額囉！請預約其他課程～",
                      confirmButtonColor: "#5d7262",
                      icon: "warning",
                    });
                    return;
                  }
                  updateDoc(roomRef, {
                    students: arrayUnion(email),
                  });
                  if (price > bearMoney) {
                    Swal.fire({ title: "熊幣餘額不足唷！請加值～", confirmButtonColor: "#5d7262", icon: "warning" });
                    return;
                  }
                  setBearMoney((prev) => prev - price);
                  const docRef = doc(db, "users", userData.uid);
                  updateDoc(docRef, {
                    cartItems: [],
                    bearMoney: bearMoney - price,
                  });
                  Swal.fire("您已預約成功！", "請到我的課程查看課表", "success");
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
    </AppointmentTooltip.Header>
  );
}

function ReserveCalendar({ teacherId }: { teacherId: string }) {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
    const getRooms = async () => {
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
    getRooms();
  }, [teacherId]);
  return (
    <Paper>
      <Scheduler data={appointments} height={600}>
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
        <Resources data={resources} mainResourceName="課程難度" />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
}

export default ReserveCalendar;
