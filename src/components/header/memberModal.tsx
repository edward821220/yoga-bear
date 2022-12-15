import { useState, useContext, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/router";
import { SetterOrUpdater } from "recoil";
import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import { updateAvatar, updateTeacherData } from "../../utils/firestore";
import { AuthContext } from "../../contexts/authContext";
import Modal from "../modal";
import Editor from "../editor/editor";
import Loading from "../../../public/loading.gif";

const Avatar = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 20px;
  overflow: hidden;
`;
const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const RadioInput = styled.input`
  margin-left: 5px;
`;
const FileLabel = styled.label`
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
const ErrorMessage = styled.p`
  color: red;
`;
const LabelFile = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
`;
const LabelButtonFile = styled.div`
  font-size: 16px;
  text-align: center;
  color: gray;
  background-color: white;
  min-width: 100px;
  max-width: 150px;
  border: 1px solid gray;
  border-radius: 5px;
  padding: 10px;
  margin: 0 auto;
  margin-bottom: 10px;
`;
const LabelInputFile = styled.input`
  display: none;
  width: 500px;
  line-height: 24px;
  padding-left: 5px;
  margin-bottom: 20px;
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

const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

interface MemberModalProps {
  setOrderQty: SetterOrUpdater<number>;
  setShowMemberModal: Dispatch<SetStateAction<boolean>>;
  setBearMoney: SetterOrUpdater<number>;
  isLogin: boolean;
  userData: {
    uid: string;
    email: string;
    identity: string;
    username: string;
    avatar: string;
  };
}
function MemberModal({ setOrderQty, setShowMemberModal, isLogin, userData, setBearMoney }: MemberModalProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setLoginData] = useState<Record<string, string>>({
    email: "jeany@gmail.com",
    password: "jeany123",
  });
  const [signupData, setSignupData] = useState<Record<string, string>>({
    username: "",
    email: "",
    password: "",
    checkPassword: "",
    identity: "student",
  });
  const [teacherIntroduction, setTeacherIntroduction] = useState("");
  const [teacherExperience, setTeacherExperience] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");
  const [needSignup, setNeedSignup] = useState(false);
  const { signup, login, logout, setUserData } = useContext(AuthContext);

  const handleClose = () => {
    setShowMemberModal(false);
    setErrorMessage("");
  };
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await login(loginData.email, loginData.password);
    if (typeof res !== "string") return;
    if (res !== "登入成功") {
      setErrorMessage("帳號或密碼錯誤唷！");
      return;
    }
    handleClose();
    Swal.fire({ title: "登入成功！", confirmButtonColor: "#5d7262", icon: "success" });
  };
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signupData.username.trim()) {
      setErrorMessage("請輸入用戶名");
      return;
    }
    if (!signupData.email.match(isValidEmail)) {
      setErrorMessage("請輸入正確的電子郵件格式");
      return;
    }
    if (signupData.password !== signupData.checkPassword) {
      setErrorMessage("請再次確認密碼是否輸入一致");
      return;
    }
    if (signupData.identity === "teacher" && (!teacherExperience.trim() || !teacherIntroduction.trim())) {
      Swal.fire({ text: "請輸入自我介紹及教學經歷", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    const target = e.target as HTMLInputElement;
    const fileInput = target.querySelector("input[type=file]") as HTMLInputElement;
    if (fileInput?.files?.length === 0) {
      Swal.fire({ text: "您的證照沒上傳唷～請確認後再送出", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    const res: string = await signup(signupData.email, signupData.password, signupData.identity, signupData.username);
    if (res === "Firebase: Error (auth/email-already-in-use).") {
      setErrorMessage("帳號已經有人使用囉！");
      return;
    }
    const uid = res;
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
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateTeacherData(uid, downloadURL, teacherIntroduction, teacherExperience);
          });
        }
      );
    }
    setNeedSignup(false);
    handleClose();
    Swal.fire({ title: "恭喜您註冊成功！", confirmButtonColor: "#5d7262", icon: "success" });
  };
  const handleUploadAvatar = async (e: React.FormEvent<HTMLLabelElement>): Promise<Promise<void>> => {
    setIsUploading(true);
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    const file = target?.files[0];
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `avatars/${userData.uid}-${compressedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      uploadTask.on(
        "state_changed",
        () => {},
        () => {
          Swal.fire({ text: "上傳失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateAvatar(userData.uid, downloadURL);
            setUserData({ ...userData, avatar: downloadURL });
            setIsUploading(false);
          });
        }
      );
    } catch (error) {
      Swal.fire({ text: "圖片壓縮失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
    }
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
                  setLoginData({
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
              defaultChecked
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
                  content={teacherExperience}
                  setContent={setTeacherExperience}
                  style={{ width: "200px", height: "100px", border: "1px solid gray", marginBottom: "10px" }}
                  placeholder="簡短描述過往經歷～"
                />
              </Label>
              <LabelFile>
                <LabelButtonFile>證照上傳</LabelButtonFile>
                <LabelInputFile
                  type="file"
                  accept="image/*, application/pdf"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setCertificatePreview(e.target.files[0].name);
                  }}
                />
                {certificatePreview && (
                  <span style={{ fontSize: "14px", textAlign: "right", marginLeft: "5px" }}>{certificatePreview}</span>
                )}
              </LabelFile>
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
            <Image src={userData.avatar} alt="avatar" fill sizes="contain" style={{ objectFit: "cover" }} />
          </Avatar>
          <MemberInfo>用戶名稱：{userData.username}</MemberInfo>
          <MemberInfo>用戶身份：{userData.identity === "teacher" ? "老師" : "學生"}</MemberInfo>
          <FileLabel onChange={handleUploadAvatar}>
            頭像上傳
            <FileInput type="file" accept="image/*" />
          </FileLabel>
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

export default MemberModal;
