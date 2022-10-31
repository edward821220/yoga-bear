import React, { useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";
import Modal from "./modal";
import { AuthContext } from "../context/authContext";

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
  margin-right: 36px;
  font-size: 24px;
  line-height: 40px;
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

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setloginData] = useState<Record<string, string>>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<Record<string, string>>({
    name: "",
    email: "",
    password: "",
    checkPassword: "",
  });
  const [identity, setIdentity] = useState("學生");
  const { signup, isLogin } = useContext(AuthContext);
  const handleClose = () => {
    setShowModal(false);
    setErrorMessage("");
  };
  const handleLogin = () => {};
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signup(signupData.email, signupData.password);
    if (typeof res !== "string") return;
    if (res !== "註冊成功") {
      setErrorMessage(res);
      return;
    }
    alert("恭喜您註冊成功!");
  };

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
          <Link href="/reserve">預約上課</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/myCourses">我的課程</Link>
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
      {showModal && (
        <Modal handleClose={handleClose}>
          {!isLogin && (
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
              <Button>登入</Button>
              <Button>還沒加入我們嗎？前往註冊~</Button>
            </Form>
          )}
          {!isLogin && (
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
              <Label>
                <LabelText>身分</LabelText>
              </Label>
              <Button>送出</Button>
              <ErrorMessage>{errorMessage}</ErrorMessage>
            </Form>
          )}
        </Modal>
      )}
    </Wrapper>
  );
}

export default Header;
