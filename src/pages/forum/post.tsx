import React, { useState, useContext } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import Image from "next/image";
import { collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Avatar from "../../../public/member.png";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import "react-quill/dist/quill.snow.css";

const Editor = dynamic(import("react-quill"), { ssr: false });

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 127.6167px - 58px);
  padding-bottom: 50px;
`;

const ArticleUser = styled.div`
  display: flex;
  margin-bottom: 15px;
`;
const UserAvatarWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;
const UserName = styled.span`
  font-size: 22px;
  line-height: 30px;
`;

const Form = styled.form`
  .quill {
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
`;
const Button = styled.button`
  display: block;
  background-color: transparent;
  padding: 10px;
  font-size: 18px;
  margin: 0 auto;
`;

const modules = {
  toolbar: [
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};
const formats = [
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

function Post() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { userData } = useContext(AuthContext);
  const router = useRouter();

  const handlePost = async () => {
    const newPostRef = doc(collection(db, "posts"));
    await setDoc(newPostRef, {
      id: newPostRef.id,
      author: userData.uid,
      title,
      content,
      time: Date.now(),
    });
    alert("您已成功提問！");
    router.push("/forum");
  };

  return (
    <Wrapper>
      <ArticleUser>
        <UserAvatarWrapper>
          <Image src={Avatar} alt="avatar" fill sizes="contain" />
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
        <Editor
          style={{ height: "320px", marginBottom: "80px" }}
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="瑜伽相關的任何問題都非常歡迎大家提問唷～"
          modules={modules}
          formats={formats}
        />
        <Button onClick={handlePost} type="button">
          發問
        </Button>
      </Form>
    </Wrapper>
  );
}

export default Post;
