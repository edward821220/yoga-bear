import React, { useState, useContext, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { useRecoilState, SetterOrUpdater } from "recoil";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Modal from "./modal";
import Editor from "./editor";
import { AuthContext } from "../contexts/authContext";
import { orderQtyState, bearMoneyState, showMemberModalState } from "../../lib/recoil";
import { db, storage } from "../../lib/firebase";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";
import MoneyIcon from "../../public/newMoney.png";
import PlusMoneyIcon from "../../public/add.png";
import MoneyBear from "../../public/money.png";
import Loading from "../../public/loading.gif";
import MenuIcon from "../../public/menu.svg";

const Wrapper = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.color5};
  height: 100px;
  position: sticky;
  top: 0;
  z-index: 66;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;
const LogoWrapper = styled.div`
  margin-right: 40px;
  margin-left: 20px;
  flex-basis: 200px;
  @media screen and (max-width: 1024px) {
    margin-right: 0;
    flex-basis: 150px;
  }
`;
const MenuLinksWrapper = styled.div`
  position: relative;
  @media screen and (max-width: 788px) {
    margin-right: auto;
  }
`;
const MenuIconWrapper = styled.div`
  position: relative;
  width: 26px;
  height: auto;
  display: none;
  @media screen and (max-width: 788px) {
    display: block;
  }
`;
const HeaderLinks = styled.ul<{ showMenu: boolean }>`
  display: flex;
  align-items: center;
  margin-right: auto;
  @media screen and (max-width: 788px) {
    display: ${(props) => (props.showMenu ? "block" : "none")};
    align-items: center;
    flex-direction: column;
    position: absolute;
    transform: translatex(-28px);
    background-color: ${(props) => props.theme.colors.color4};
    padding: 5px 0;
  }
`;
const HeaderLink = styled.li`
  margin-right: 20px;
  font-size: 18px;
  line-height: 40px;
  width: 80px;
  text-align: center;
  a {
    color: ${(props) => props.theme.colors.color2};
  }
  @media screen and (max-width: 1024px) {
    margin-right: 10px;
  }
  @media screen and (max-width: 788px) {
    font-size: 16px;
    margin: 0;
    padding: 0 5px;
    &:hover {
      background-color: ${(props) => props.theme.colors.color3};
      a {
        color: ${(props) => props.theme.colors.color1};
      }
      span {
        color: ${(props) => props.theme.colors.color1};
      }
    }
  }
`;

const MycoursesLink = styled.span`
  color: ${(props) => props.theme.colors.color2};
  cursor: pointer;
  @media screen and (max-width: 1024px) {
    margin-right: 10px;
  }
  @media screen and (max-width: 788px) {
    margin-right: 0;
  }
`;

const Member = styled.ul`
  display: flex;
  align-items: center;
  position: relative;
  @media screen and (max-width: 468px) {
    margin-bottom: 36px;
  }
`;

const MoneyDisplay = styled.div`
  width: 140px;
  height: 44px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 4px;
  margin-right: 50px;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  @media screen and (max-width: 1024px) {
    margin-right: 24px;
    width: 120px;
    height: 36px;
  }
  @media screen and (max-width: 468px) {
    position: absolute;
    transform: translate(-8px, 42px);
    width: 100px;
    height: 24px;
    margin-right: 0;
  }
`;

const MoneyIconWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 5px;
  @media screen and (max-width: 1024px) {
    width: 24px;
    height: 24px;
  }
  @media screen and (max-width: 468px) {
    width: 17px;
    height: 17px;
  }
`;
const MoneyQty = styled.p`
  font-size: 18px;
  @media screen and (max-width: 1024px) {
    font-size: 16px;
  }
`;
const MoneyPlusWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  cursor: pointer;
  @media screen and (max-width: 1024px) {
    width: 24px;
    height: 24px;
  }
  @media screen and (max-width: 468px) {
    width: 22px;
    height: 22px;
  }
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
    background-color: ${(props) => props.theme.colors.color4};
    border: 2px solid ${(props) => props.theme.colors.color3};
    border-radius: 50%;
    z-index: -1;
    @media screen and (max-width: 1024px) {
      width: 40px;
      height: 40px;
    }
  }
  @media screen and (max-width: 1024px) {
    width: 32px;
    margin-right: 24px;
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
  color: ${(props) => props.theme.colors.color1};
  background-color: ${(props) => props.theme.colors.color3};
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
    background-color: ${(props) => props.theme.colors.color4};
    border-radius: 50%;
    border: 2px solid ${(props) => props.theme.colors.color3};
    z-index: -1;
    @media screen and (max-width: 1024px) {
      width: 40px;
      height: 40px;
    }
  }
  @media screen and (max-width: 1024px) {
    width: 32px;
    height: 31px;
    margin-right: 24px;
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
  border-radius: 50%;
  margin-bottom: 20px;
  overflow: hidden;
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
const FileLable = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13.33px;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
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
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
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
  setBearMoney: SetterOrUpdater<number>;
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
  setBearMoney,
}: MemberModalProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
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
  const [teacherIntroduction, setTeacherIntroduction] = useState("");
  const [teacherExprience, setTeacherExprience] = useState("");
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
    Swal.fire({ title: "登入成功！", confirmButtonColor: "#5d7262", icon: "success" });
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
        () => {
          Swal.fire({ text: "上傳失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const docRef = doc(db, "users", uid);
            updateDoc(docRef, {
              certificate: downloadURL,
              teacher_introduction: teacherIntroduction,
              teacher_exprience: teacherExprience,
              beTeacherTime: Date.now(),
            });
          });
        }
      );
    }
    setNeedSignup(false);
    handleClose();
    Swal.fire({ title: "恭喜您註冊成功！", confirmButtonColor: "#5d7262", icon: "success" });
  };
  const handleUploadAvatar = (e: React.FormEvent<HTMLLabelElement>): void => {
    setIsUploading(true);
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    const file = target?.files[0];
    const storageRef = ref(storage, `avatars/${userData.uid}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      () => {},
      () => {
        Swal.fire({ text: "上傳失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          const docRef = doc(db, "users", userData.uid);
          await updateDoc(docRef, {
            photoURL: downloadURL,
          });
          setUserData({ ...userData, avatar: downloadURL });
          setIsUploading(false);
        });
      }
    );
  };
  if (isUploading)
    return (
      <Modal handleClose={handleClose}>
        <Image src={Loading} alt="loading" style={{ margin: "0 auto" }} width={100} height={100} />
      </Modal>
    );

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
                <Editor
                  content={teacherIntroduction}
                  setContent={setTeacherIntroduction}
                  style={{ width: "200px", height: "100px", border: "1px solid gray", marginBottom: "10px" }}
                  placeholder="簡短介紹讓同學認識～"
                />
              </Label>
              <Label>
                <LabelText>師資班及教學經歷：</LabelText>
                <Editor
                  content={teacherExprience}
                  setContent={setTeacherExprience}
                  style={{ width: "200px", height: "100px", border: "1px solid gray", marginBottom: "10px" }}
                  placeholder="簡短描述過往經歷～"
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
            <Image src={userData.avatar} alt="avatar" fill sizes="contain" />
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
              setBearMoney(0);
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
      Swal.fire({ title: "請輸入正確的信用卡格式", confirmButtonColor: "#5d7262" });
      return;
    }
    if (!paymentData.expiration.match(isValidExpiration)) {
      Swal.fire({ title: "請輸入正確的信用卡期限", confirmButtonColor: "#5d7262" });
      return;
    }
    if (!paymentData.cvv.match(isValidCCV)) {
      Swal.fire({ title: "請輸入正確的信用卡號碼", confirmButtonColor: "#5d7262" });
      return;
    }
    setBearMoney((prev) => prev + Number(paymentData.money));
    Swal.fire({ title: "儲值成功！可以上課囉！", confirmButtonColor: "#5d7262", icon: "success" });
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
        <Image src={MoneyBear} alt="money-bear" width={100} height={100} />
      </Form>
    </Modal>
  );
}

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
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
      <MenuLinksWrapper
        onMouseOver={() => {
          setShowMenu(true);
        }}
        onMouseOut={() => {
          setShowMenu(false);
        }}
      >
        <MenuIconWrapper>
          <Image src={MenuIcon} alt="menu" />
        </MenuIconWrapper>
        <HeaderLinks showMenu={showMenu}>
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
                  Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
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
      </MenuLinksWrapper>
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
                Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
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
                Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
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
          setBearMoney={setBearMoney}
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
