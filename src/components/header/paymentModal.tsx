import { useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import InputMask from "react-input-mask";
import Image from "next/image";
import { SetterOrUpdater } from "recoil";
import { updateBearMoney } from "../../utils/firestore";
import MoneyBear from "../../../public/money.png";
import Modal from "../modal";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const FormTitle = styled.h4`
  font-size: 24px;
  text-align: center;
  margin-bottom: 36px;
`;

const Label = styled.label``;
const LabelText = styled.p`
  margin-bottom: 5px;
`;
const FormInput = styled.input`
  margin-bottom: 10px;
  height: 30px;
  width: 200px;
  padding-left: 5px;
`;
const PaymentInputMask = styled(InputMask)`
  margin-bottom: 10px;
  height: 30px;
  width: 200px;
  padding-left: 5px;
`;

const Button = styled.button`
  display: block;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  min-width: 80px;
  padding: 5px 10px;
  margin-bottom: 10px;
  cursor: pointer;
`;
const isValidCardNumber = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
const isValidExpiration = /^\d{2}\/\d{2}$/;
const isValidCVV = /^[0-9]{3}$/;

interface PaymentModalProps {
  setShowPaymentModal: Dispatch<SetStateAction<boolean>>;
  bearMoney: number;
  setBearMoney: SetterOrUpdater<number>;
  userId: string;
}

function PaymentModal({ setShowPaymentModal, bearMoney, setBearMoney, userId }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState<Record<string, string>>({
    money: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });
  const handleClose = () => {
    setShowPaymentModal(false);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentData.cardNumber.match(isValidCardNumber)) {
      Swal.fire({ title: "請輸入正確的信用卡格式", confirmButtonColor: "#5d7262" });
      return;
    }
    if (!paymentData.expiration.match(isValidExpiration)) {
      Swal.fire({ title: "請輸入正確的信用卡期限", confirmButtonColor: "#5d7262" });
      return;
    }
    if (!paymentData.cvv.match(isValidCVV)) {
      Swal.fire({ title: "請輸入正確的安全碼", confirmButtonColor: "#5d7262" });
      return;
    }
    setBearMoney((prev) => prev + Number(paymentData.money));
    Swal.fire({ title: "儲值成功！可以上課囉！", confirmButtonColor: "#5d7262", icon: "success" });
    setShowPaymentModal(false);
    await updateBearMoney(userId, bearMoney, Number(paymentData.money));
  };
  return (
    <Modal handleClose={handleClose}>
      <Form onSubmit={handleSubmit}>
        <FormTitle>儲值熊幣</FormTitle>
        <Label>
          <LabelText>儲值金額(1:1 NTD)</LabelText>
          <FormInput
            value={paymentData.money}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const isNumber = /^[0-9\s]*$/;
              if (!isNumber.test(e.target.value)) return;
              setPaymentData({ ...paymentData, money: e.target.value });
            }}
          />
        </Label>
        <Label>
          <LabelText>信用卡號</LabelText>
          <PaymentInputMask
            mask="9999-9999-9999-9999"
            maskChar=" "
            value={paymentData.cardNumber}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPaymentData({ ...paymentData, cardNumber: e.target.value });
            }}
          />
        </Label>
        <Label>
          <LabelText>到期日</LabelText>
          <PaymentInputMask
            mask="99/99"
            maskChar=" "
            value={paymentData.expiration}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPaymentData({ ...paymentData, expiration: e.target.value });
            }}
          />
        </Label>
        <Label>
          <LabelText>安全碼</LabelText>
          <PaymentInputMask
            mask="999"
            maskChar=" "
            value={paymentData.cvv}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPaymentData({ ...paymentData, cvv: e.target.value });
            }}
          />
        </Label>
        <Button type="submit">確定加值</Button>
        <Image src={MoneyBear} alt="money-bear" width={100} height={100} />
      </Form>
    </Modal>
  );
}

export default PaymentModal;
