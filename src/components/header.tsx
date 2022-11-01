import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";
import Modal from "./modal";
import { AuthContext } from "../context/authContext";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2px solid gray;
  margin-bottom: 36px;
  position: sticky;
  top: 0;
`;
const LogoWrapper = styled.div`
  margin-right: 100px;
  width: 360px;
`;
const HeaderLinks = styled.ul`
  display: flex;
  align-items: center;
  margin-right: auto;
`;
const HeaderLink = styled.li`
  margin-right: 66px;
  font-size: 24px;
  line-height: 40px;
  a {
    color: #01815b;
  }
`;
const Member = styled.ul`
  display: flex;
  align-items: center;
`;
const IconWrapper = styled.li`
  margin-right: 36px;
  width: 45px;
  cursor: pointer;
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
  { key: "name", title: "用戶名", type: "text", placeholder: "請輸入您的用戶名" },
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
const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

function MemberModal({ setShowModal }: Props) {
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
  const { signup, isLogin, login, logout } = useContext(AuthContext);
  const handleClose = () => {
    setShowModal(false);
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
              setNeedSignup(false);
              handleClose();
            }}
          >
            登出
          </Button>
        </Form>
      )}
    </Modal>
  );
}

function Header() {
  const [showModal, setShowModal] = useState(false);

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
          <Link href="/reserve">一對一找老師</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/myCourses/videoCourses">我的學習</Link>
        </HeaderLink>
      </HeaderLinks>
      <Member>
        <IconWrapper>
          <Link href="/cart">
            <Image src={CartLogo} alt="cart" />
          </Link>
        </IconWrapper>
        <IconWrapper
          onClick={() => {
            setShowModal(true);
          }}
        >
          <Image src={MemberLogo} alt="member" />
        </IconWrapper>
      </Member>
      {showModal && <MemberModal setShowModal={setShowModal} />}
    </Wrapper>
  );
}

export default Header;
