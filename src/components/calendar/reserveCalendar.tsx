import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Paper from "@mui/material/Paper";
import Image from "next/image";
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
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRecoilState } from "recoil";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import { bearMoneyState } from "../../../lib/recoil";
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
  const onPriceChange = (nextValue: string) => {
    onFieldChange({ price: nextValue });
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
      <AppointmentForm.Label text="課程價格" type="titleLabel" />
      <AppointmentForm.TextEditor
        value={appointmentData.price}
        onValueChange={onPriceChange}
        placeholder="請輸入課程價格"
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

function Header({ appointmentData, ...restProps }: AppointmentTooltip.HeaderProps) {
  const { userData, isLogin } = useContext(AuthContext);
  const { username, email } = userData;
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);

  return (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      <ReserveButtonWrapper>
        <Image
          src={ReserveButton}
          alt="reserve-btn"
          width={36}
          onClick={() => {
            if (!isLogin) {
              alert("先登入才能預約課程唷！");
              return;
            }
            if (!appointmentData) return;
            const price = Number(appointmentData.price as string) || 0;
            const confirm = window.confirm(`確定要預約嗎？將扣除 ${price} 元熊幣`);
            if (!confirm) return;
            const roomRef = doc(db, "rooms", appointmentData.id as string);
            updateDoc(roomRef, {
              students: arrayUnion({ username, email }),
            });
            if (price > bearMoney) {
              alert("熊幣餘額不足唷！請加值～");
              return;
            }
            setBearMoney((prev) => prev - price);
            const docRef = doc(db, "users", userData.uid);
            updateDoc(docRef, {
              cartItems: [],
              bearMoney: bearMoney - price,
            });
            alert("您已預約成功！");
          }}
        />
      </ReserveButtonWrapper>
    </AppointmentTooltip.Header>
  );
}

function ReserveCalendar({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AppointmentModel[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  useEffect(() => {
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
    <Paper>
      <Scheduler data={data} height={600}>
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
        <Resources data={resources} mainResourceName="Level" />
        <AllDayPanel />
      </Scheduler>
    </Paper>
  );
}

export default ReserveCalendar;
