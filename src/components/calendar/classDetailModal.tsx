import { AppointmentModel } from "@devexpress/dx-react-scheduler";
import styled from "styled-components";
import Image from "next/image";
import ClassPic from "../../../public/class.jpg";
import Modal from "../modal";

const DetailList = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  &:last-child {
    border-top: 1px solid ${(props) => props.theme.colors.color2};
    margin-top: 10px;
  }
`;
const Detail = styled.li`
  font-size: 18px;
  margin-bottom: 10px;
  width: 90%;
  margin: 0 auto 10px auto;
  list-style: disc;
`;

interface ClassDetailModalProps {
  handleClose(): void;
  appointmentData: AppointmentModel | undefined;
}
function ClassDetailModal({ handleClose, appointmentData }: ClassDetailModalProps) {
  return (
    <Modal handleClose={handleClose}>
      <Image src={ClassPic} alt="class" />
      <DetailList>
        <Detail>課程名稱：{appointmentData?.title}</Detail>
        <Detail>開課老師：{appointmentData?.teacherName}</Detail>
        <Detail>課程價格：NT. {appointmentData?.price}</Detail>
        <Detail>課程人數：{appointmentData?.maximum}</Detail>
      </DetailList>
      <DetailList>
        <Detail>課程說明：{appointmentData?.description}</Detail>
        <Detail>注意事項：{appointmentData?.precaution}</Detail>
      </DetailList>
    </Modal>
  );
}

export default ClassDetailModal;
