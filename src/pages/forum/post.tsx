import React, { useState, useContext } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import RichEditor from "../../components/editor/richEditor";
import Bear from "../../../public/Yoga-Bear.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  padding: 20px 0;
`;

const Container = styled.div`
  max-width: 810px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.color1};
  padding: 20px;
`;

const ArticleUser = styled.div`
  display: flex;
  margin-bottom: 15px;
`;
const UserAvatarWrapper = styled.div`
  position: relative;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
`;
const UserName = styled.span`
  font-size: 24px;
  line-height: 66px;
`;

const Form = styled.form`
  .quill {
    height: 400px;
    margin-bottom: 80px;
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
  }
`;

const Label = styled.label``;
const Title = styled.input`
  margin-bottom: 20px;
  height: 40px;
  width: 100%;
  font-size: 18px;
  line-height: 40px;
  padding-left: 10px;
  border: 1px solid lightgray;
`;
const Button = styled.button`
  display: block;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  padding: 10px;
  font-size: 18px;
  margin: 0 auto;
  cursor: pointer;
`;
const SpeechBubble = styled.div`
  position: fixed;
  bottom: 220px;
  right: 40px;
  background: #ddd;
  color: #333;
  display: inline-block;
  font-size: 14px;
  line-height: 28px;
  margin-bottom: 1em;
  padding: 10px;
  text-align: center;
  vertical-align: top;
  width: 250px;
  &::after {
    border: 1em solid transparent;
    border-top-color: #ddd;
    content: "";
    margin-left: -1em;
    position: absolute;
    top: 100%;
    left: 50%;
    width: 0;
    height: 0;
  }
  @media screen and (max-width: 1280px) {
    display: none;
  }
`;
const BearWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 60px;
  @media screen and (max-width: 1280px) {
    display: none;
  }
`;

function Post() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { isLogin, userData } = useContext(AuthContext);
  const router = useRouter();

  const handlePost = async () => {
    if (!isLogin) {
      Swal.fire({ title: "登入後才能發問唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    if (!title.trim()) {
      Swal.fire({ title: "請輸入標題！", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    if (!content.trim()) {
      Swal.fire({ title: "請輸入內容！", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    const newPostRef = doc(collection(db, "posts"));
    await setDoc(newPostRef, {
      id: newPostRef.id,
      author: userData.uid,
      title,
      content,
      time: Date.now(),
    });
    Swal.fire({ title: "您已成功提問！", confirmButtonColor: "#5d7262", icon: "success" });
    router.push("/forum");
  };

  return (
    <>
      <Head>
        <title>我想問問題 - Yoga Bear</title>
      </Head>
      <Wrapper>
        <Container>
          <ArticleUser>
            <UserAvatarWrapper>
              <Image src={userData.avatar} alt="avatar" fill sizes="contain" />
            </UserAvatarWrapper>
            <UserName>{userData.username}</UserName>
          </ArticleUser>
          <Form>
            <Label>
              <Title
                value={title}
                placeholder="想問什麼呢？"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
            </Label>
            <RichEditor content={content} setContent={setContent} />
            <Button onClick={handlePost} type="button">
              發問
            </Button>
          </Form>
        </Container>
        <SpeechBubble>
          瑜伽相關的問題都歡迎大家提問唷
          <br />
          不要害羞～本熊會陪著你問問題的
        </SpeechBubble>
        <BearWrapper>
          <Image src={Bear} alt="bear" width={200} height={200} />
        </BearWrapper>
      </Wrapper>
    </>
  );
}

export default Post;
