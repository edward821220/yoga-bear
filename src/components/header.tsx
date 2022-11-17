import React, { useState, useContext, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useRecoilState, SetterOrUpdater } from "recoil";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";
import Modal from "./modal";
import { AuthContext } from "../contexts/authContext";
import { orderQtyState, bearMoneyState } from "../../lib/recoil";
import { db, storage } from "../../lib/firebase";
import MoneyIcon from "../../public/newMoney.png";
import PlusMoneyIcon from "../../public/add.png";

const Wrapper = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.color6};
  height: 100px;
  position: sticky;
  top: 0;
  z-index: 66;
  border-bottom: 6px solid ${(props) => props.theme.colors.color4};
`;
const LogoWrapper = styled.div`
  margin-right: 100px;
  flex-basis: 200px;
`;
const HeaderLinks = styled.ul`
  display: flex;
  align-items: center;
  margin-right: auto;
`;
const HeaderLink = styled.li`
  margin-right: 36px;
  font-size: 18px;
  line-height: 40px;
  border: 2px solid ${(props) => props.theme.colors.color4};
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.color3};
  width: 120px;
  text-align: center;
  a {
    color: ${(props) => props.theme.colors.color2};
  }
`;
const MycoursesLink = styled.span`
  color: ${(props) => props.theme.colors.color2};
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
  margin-right: 50px;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.colors.color3};
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
    background-color: ${(props) => props.theme.colors.color5};
    border: 2px solid ${(props) => props.theme.colors.color4};
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
  right: -10px;
  border-radius: 50%;
  color: ${(props) => props.theme.colors.color3};
  background-color: ${(props) => props.theme.colors.color4};
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
    background-color: ${(props) => props.theme.colors.color5};
    border-radius: 50%;
    border: 2px solid ${(props) => props.theme.colors.color4};
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
const Avatar = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
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
const FormTextarea = styled.textarea`
  font-size: 14px;
  width: 200px;
  height: 60px;
  padding-top: 5px;
  padding-left: 5px;
  margin-bottom: 10px;
  resize: none;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const RadioInput = styled.input`
  margin-left: 5px;
`;
const FileLable = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13.33px;
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color3};
  width: 100px;
  height: 33.5px;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
`;
const FileInput = styled.input`
  display: none;
`;
const MemberInfo = styled.p`
  line-height: 20px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  display: block;
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color3};
  border-radius: 5px;
  min-width: 80px;
  padding: 5px 10px;
  margin-bottom: 10px;
  cursor: pointer;
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
  signup: (emil: string, password: string, identity: string, username: string) => Promise<string>;
  login(email: string, password: string): void;
  logout(): void;
  userData: {
    uid: string;
    email: string;
    identity: string;
    username: string;
    avatar: string;
  };
  setUserData: React.Dispatch<
    React.SetStateAction<{
      uid: string;
      email: string;
      identity: string;
      username: string;
      avatar: string;
    }>
  >;
}

function MemberModal({
  setOrderQty,
  setShowMemberModal,
  isLogin,
  login,
  logout,
  signup,
  userData,
  setUserData,
}: MemberModalProps) {
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
  const [teacherSignupData, setTeacherSignupData] = useState<Record<string, string>>({
    introduction: "",
    exprience: "",
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
    const res: string = await signup(signupData.email, signupData.password, signupData.identity, signupData.username);
    if (res.includes("Error")) {
      setErrorMessage(res);
      return;
    }
    const uid = res;
    const target = e.target as HTMLInputElement;
    const fileInput = target.querySelector("input[type=file]") as HTMLInputElement;
    if (fileInput?.files) {
      const file = fileInput?.files[0];
      const storageRef = ref(storage, `certificate/${userData.uid}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const docRef = doc(db, "users", uid);
            updateDoc(docRef, {
              certificate: downloadURL,
              teacher_introduction: teacherSignupData.introduction,
              teacher_exprience: teacherSignupData.exprience,
            });
          });
        }
      );
    }
    setNeedSignup(false);
    handleClose();
    alert("恭喜您註冊成功!");
  };
  const handleUploadAvatar = (e: React.FormEvent<HTMLLabelElement>): void => {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    const file = target?.files[0];
    const storageRef = ref(storage, `avatars/${userData.uid}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const docRef = doc(db, "users", userData.uid);
          updateDoc(docRef, {
            photoURL: downloadURL,
          });
          setUserData({ ...userData, avatar: downloadURL });
        });
      }
    );
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
          {signupData.identity === "teacher" && (
            <>
              <Label>
                <LabelText>自我介紹：</LabelText>
                <FormTextarea
                  placeholder="簡短介紹讓同學認識～"
                  value={teacherSignupData.introduction}
                  required
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setTeacherSignupData({
                      ...teacherSignupData,
                      introduction: e.target.value,
                    });
                  }}
                />
              </Label>
              <Label>
                <LabelText>師資班及教學經歷：</LabelText>
                <FormTextarea
                  placeholder="簡短描述過往經歷～"
                  value={teacherSignupData.exprience}
                  required
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setTeacherSignupData({
                      ...teacherSignupData,
                      exprience: e.target.value,
                    });
                  }}
                />
              </Label>
              <Label>
                <LabelText>證照上傳</LabelText>
                <FormInput type="file" accept="image/*, application/pdf" required />
              </Label>
            </>
          )}
          <Button type="submit">送出</Button>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </Form>
      )}
      {isLogin && (
        <Form>
          <FormTitle>會員資訊</FormTitle>
          <Avatar>
            <Image src={userData.avatar || MemberLogo} alt="avatar" fill sizes="contain" />
          </Avatar>
          <MemberInfo>用戶名稱：{userData.username}</MemberInfo>
          <MemberInfo>用戶身份：{userData.identity === "teacher" ? "老師" : "學生"}</MemberInfo>
          <FileLable onChange={handleUploadAvatar}>
            頭像上傳
            <FileInput type="file" accept="image/*" />
          </FileLable>
          <Button
            type="button"
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
    setBearMoney((prev) => prev + Number(paymentData.money));
    alert("儲值成功！可以上課囉！");
    setShowPaymentModal(false);
    const docRef = doc(db, "users", userId);
    updateDoc(docRef, {
      bearMoney: bearMoney + Number(paymentData.money),
    });
  };
  return (
    <Modal handleClose={handleClose}>
      <Form onSubmit={handleSubmit}>
        <FormTitle>儲值熊幣(1:1 NTD)</FormTitle>
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
  const { signup, isLogin, login, logout, userData, setUserData } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const getCartItems = async () => {
      if (!userData.uid) return;
      const docRef = doc(db, "users", userData.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const qty: number = docSnap.data()?.cartItems?.length;
        const money: number = docSnap.data()?.bearMoney;
        setOrderQty(qty);
        setBearMoney(money || 0);
      }
    };
    getCartItems();
  }, [userData.uid, setOrderQty, setBearMoney]);

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
          <Link href="/findTeachers">預約老師</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/forum">問答園地</Link>
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
          userData={userData}
          setUserData={setUserData}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          bearMoney={bearMoney}
          setBearMoney={setBearMoney}
          userId={userData.uid}
        />
      )}
    </Wrapper>
  );
}

export default Header;
