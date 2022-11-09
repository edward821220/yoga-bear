import React, { useState, useContext, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useRecoilState, SetterOrUpdater } from "recoil";
import { getDoc, doc } from "firebase/firestore";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";
import Modal from "./modal";
import { AuthContext } from "../contexts/authContext";
import { orderQtyState, bearMoneyState } from "../../lib/recoil";
import { db } from "../../lib/firebase";
import MoneyIcon from "../../public/newMoney.png";
import PlusMoneyIcon from "../../public/add.png";

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  position: sticky;
  top: 0;
  background-color: #ece5da;
  z-index: 99;
  flex-wrap: wrap;
`;
const LogoWrapper = styled.div`
  margin-right: 120px;
  flex-basis: 200px;
`;
const HeaderLinks = styled.ul`
  display: flex;
  align-items: center;
  margin-right: auto;
`;
const HeaderLink = styled.li`
  margin-right: 66px;
  font-size: 18px;
  line-height: 40px;
  border: 2px solid #654116;
  border-radius: 5px;
  background-color: #fff;
  width: 140px;
  text-align: center;
  a {
    color: #654116;
  }
`;
const MycoursesLink = styled.span`
  color: #654116;
  cursor: pointer;
`;

const Member = styled.ul`
  display: flex;
  align-items: center;
`;

const MoneyDisplay = styled.div`
  width: 140px;
  height: 44px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  margin-right: 100px;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
`;

const MoneyIconWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 5px;
`;
const MoneyQty = styled.p`
  font-size: 18px;
`;
const MoneyPlusWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

const CartIconWrapper = styled.li`
  margin-right: 36px;
  width: 40px;
  position: relative;
  cursor: pointer;
  &:after {
    content: "";
    width: 50px;
    height: 50px;
    position: absolute;
    bottom: 0;
    transform: translateY(1px) translateX(-5px);
    background-color: #f4d5b0;
    border: 2px solid #654116;
    border-radius: 50%;
    z-index: -1;
  }
`;
const OrderQty = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  padding-top: 3px;
  text-align: center;
  font-size: 13px;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  background-color: #fff;
  color: #654116;
`;

const MemberIconWrapper = styled.li`
  margin-right: 36px;
  width: 40px;
  position: relative;
  cursor: pointer;
  &:after {
    content: "";
    width: 50px;
    height: 50px;
    bottom: 0;
    transform: translateY(5px) translateX(-5px);
    position: absolute;
    background-color: #f4d5b0;
    border-radius: 50%;
    border: 2px solid #654116;
    z-index: -1;
  }
`;
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
const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const RadioInput = styled.input`
  margin-left: 5px;
`;

const Button = styled.button`
  display: block;
  margin-bottom: 10px;
  padding: 5px;
`;
const ErrorMessage = styled.p`
  color: red;
`;

const loginForm = [
  { key: "email", title: "Email", type: "email", placeholder: "請輸入電子信箱" },
  {
    key: "password",
    title: "密碼",
    type: "password",
    placeholder: "請輸入密碼",
  },
];

const signupForm = [
  { key: "username", title: "用戶名", type: "text", placeholder: "請輸入您的用戶名" },
  { key: "email", title: "Email", type: "email", placeholder: "請輸入電子信箱" },
  {
    key: "password",
    title: "密碼",
    type: "password",
    placeholder: "請輸入密碼",
  },
  {
    key: "checkPassword",
    title: "確認密碼",
    type: "password",
    placeholder: "請再次輸入密碼",
  },
];

const paymentForm = [
  {
    key: "money",
    title: "儲值金額",
    type: "number",
    placeholder: "請輸入需要儲值多少熊幣",
    min: 100,
    max: 10000,
    step: 50,
  },
  { key: "cardNumber", title: "信用卡號", type: "text", placeholder: "OOOO-OOOO-OOOO-OOOO" },
  { key: "expiration", title: "到期日", type: "text", placeholder: "OO/OO" },
  { key: "cvv", title: "安全碼", type: "text", placeholder: "OOO" },
];

const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const isValidCardNumber = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
const isValidExpiration = /^\d{2}\/\d{2}$/;
const isValidCCV = /\d{3}$/;

interface MemberModalProps {
  setOrderQty: SetterOrUpdater<number>;
  setShowMemberModal: Dispatch<SetStateAction<boolean>>;
  isLogin: boolean;
  signup: (emil: string, password: string, identity: string, username: string) => void;
  login(email: string, password: string): void;
  logout(): void;
}

function MemberModal({ setOrderQty, setShowMemberModal, isLogin, login, logout, signup }: MemberModalProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setloginData] = useState<Record<string, string>>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<Record<string, string>>({
    username: "",
    email: "",
    password: "",
    checkPassword: "",
    identity: "student",
  });

  const [needSignup, setNeedSignup] = useState(false);

  const handleClose = () => {
    setShowMemberModal(false);
    setErrorMessage("");
  };
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await login(loginData.email, loginData.password);
    if (typeof res !== "string") return;
    if (res !== "登入成功") {
      setErrorMessage(res);
      return;
    }
    handleClose();
    alert("恭喜您登入成功!");
  };
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signupData.email.match(isValidEmail)) {
      setErrorMessage("請輸入正確的電子郵件格式");
      return;
    }
    if (signupData.password !== signupData.checkPassword) {
      setErrorMessage("請再次確認密碼是否輸入一致");
      return;
    }
    const res = await signup(signupData.email, signupData.password, signupData.identity, signupData.username);
    if (typeof res !== "string") return;
    if (res !== "註冊成功") {
      setErrorMessage(res);
      return;
    }
    setNeedSignup(false);
    handleClose();
    alert("恭喜您註冊成功!");
  };
  return (
    <Modal handleClose={handleClose}>
      {!isLogin && !needSignup && (
        <Form onSubmit={handleLogin}>
          <FormTitle>歡迎回來</FormTitle>
          {loginForm.map((item) => (
            <Label key={item.key}>
              <LabelText>{item.title}：</LabelText>
              <FormInput
                type={item.type}
                placeholder={item.placeholder}
                value={loginData[item.key]}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setloginData({
                    ...loginData,
                    [item.key]: e.target.value,
                  });
                }}
              />
            </Label>
          ))}
          <Button type="submit">登入</Button>
          <Button
            type="button"
            onClick={() => {
              setNeedSignup(true);
            }}
          >
            還沒加入我們嗎？前往註冊~
          </Button>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </Form>
      )}
      {!isLogin && needSignup && (
        <Form onSubmit={handleSignup}>
          <FormTitle>歡迎加入</FormTitle>
          {signupForm.map((item) => (
            <Label key={item.key}>
              <LabelText>{item.title}：</LabelText>
              <FormInput
                type={item.type}
                placeholder={item.placeholder}
                value={signupData[item.key]}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSignupData({
                    ...signupData,
                    [item.key]: e.target.value,
                  });
                }}
              />
            </Label>
          ))}
          <RadioLabel>
            <LabelText>我是學生</LabelText>
            <RadioInput
              type="radio"
              value="student"
              name="identity"
              onChange={(e) => {
                setSignupData({ ...signupData, identity: e.target.value });
              }}
            />
          </RadioLabel>
          <RadioLabel>
            <LabelText>我是老師</LabelText>
            <RadioInput
              type="radio"
              value="teacher"
              name="identity"
              onChange={(e) => {
                setSignupData({ ...signupData, identity: e.target.value });
              }}
            />
          </RadioLabel>
          <Button type="submit">送出</Button>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </Form>
      )}
      {isLogin && (
        <Form onSubmit={handleSignup}>
          <FormTitle>會員資訊</FormTitle>
          <Image src={MemberLogo} alt="avatar" width={200} />
          <Button
            type="submit"
            onClick={() => {
              logout();
              setOrderQty(0);
              setNeedSignup(false);
              handleClose();
              router.push("/");
            }}
          >
            登出
          </Button>
        </Form>
      )}
    </Modal>
  );
}

interface PaymentModalProps {
  setShowPaymentModal: Dispatch<SetStateAction<boolean>>;
  setBearMoney: SetterOrUpdater<number>;
}

function PaymentModal({ setShowPaymentModal, setBearMoney }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState<Record<string, string>>({
    money: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });
  const handleClose = () => {
    setShowPaymentModal(false);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentData.cardNumber.match(isValidCardNumber)) {
      alert("請輸入正確的信用卡格式");
      return;
    }
    if (!paymentData.expiration.match(isValidExpiration)) {
      alert("請輸入正確的信用卡期限");
      return;
    }
    if (!paymentData.cvv.match(isValidCCV)) {
      alert("請輸入正確的信用卡安全碼");
      return;
    }
    setBearMoney(Number(paymentData.money));
    alert("儲值成功！可以上課囉！");
    setShowPaymentModal(false);
  };
  return (
    <Modal handleClose={handleClose}>
      <Form onSubmit={handleSubmit}>
        <FormTitle>儲值熊幣(1:1台幣)</FormTitle>
        {paymentForm.map((item) => {
          if (item.type === "number") {
            return (
              <Label key={item.key}>
                <LabelText>{item.title}</LabelText>
                <FormInput
                  placeholder={item.placeholder}
                  type={item.type}
                  value={paymentData[item.key]}
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPaymentData({ ...paymentData, [item.key]: e.target.value });
                  }}
                />
              </Label>
            );
          }
          return (
            <Label key={item.key}>
              <LabelText>{item.title}</LabelText>
              <FormInput
                placeholder={item.placeholder}
                type={item.type}
                value={paymentData[item.key]}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPaymentData({ ...paymentData, [item.key]: e.target.value });
                }}
              />
            </Label>
          );
        })}
        <Button type="submit">確定加值</Button>
      </Form>
    </Modal>
  );
}

function Header() {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);
  const { signup, isLogin, login, logout, userData } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const getCartItems = async () => {
      if (!userData.uid) return;
      const docRef = doc(db, "users", userData.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const qty: number = docSnap.data()?.cartItems?.length;
        setOrderQty(qty);
      }
    };
    getCartItems();
  }, [userData.uid, setOrderQty]);

  return (
    <Wrapper>
      <LogoWrapper>
        <Link href="/">
          <Image src={BearLogo} alt="logo" />
        </Link>
      </LogoWrapper>
      <HeaderLinks>
        <HeaderLink>
          <Link href="/videoCourses">影音課程</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/findTeachers">我想找老師</Link>
        </HeaderLink>
        <HeaderLink>
          <MycoursesLink
            onClick={() => {
              if (!isLogin) {
                alert("您還沒登入唷！");
                setShowMemberModal(true);
                return;
              }
              router.push("/myCourses/videoCourses");
            }}
          >
            我的課程
          </MycoursesLink>
        </HeaderLink>
      </HeaderLinks>
      <Member>
        <MoneyDisplay>
          <MoneyIconWrapper>
            <Image src={MoneyIcon} alt="moneyIcon" fill sizes="contain" />
          </MoneyIconWrapper>
          <MoneyQty>{bearMoney}</MoneyQty>
          <MoneyPlusWrapper
            onClick={() => {
              if (!isLogin) {
                setShowPaymentModal(false);
                alert("您還沒登入唷！");
                setShowMemberModal(true);
                return;
              }
              setShowPaymentModal(true);
            }}
          >
            <Image src={PlusMoneyIcon} alt="plus" fill sizes="contain" />
          </MoneyPlusWrapper>
        </MoneyDisplay>

        <CartIconWrapper>
          <Image
            src={CartLogo}
            alt="cart"
            onClick={() => {
              if (!isLogin) {
                alert("您還沒登入唷！");
                setShowMemberModal(true);
                return;
              }
              router.push("/cart");
            }}
          />
          {orderQty > 0 && <OrderQty>{orderQty}</OrderQty>}
        </CartIconWrapper>
        <MemberIconWrapper
          onClick={() => {
            setShowMemberModal(true);
          }}
        >
          <Image src={MemberLogo} alt="member" />
        </MemberIconWrapper>
      </Member>
      {showMemberModal && (
        <MemberModal
          setOrderQty={setOrderQty}
          setShowMemberModal={setShowMemberModal}
          isLogin={isLogin}
          login={login}
          logout={logout}
          signup={signup}
        />
      )}
      {showPaymentModal && <PaymentModal setShowPaymentModal={setShowPaymentModal} setBearMoney={setBearMoney} />}
    </Wrapper>
  );
}

export default Header;
