import React, { useState } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import Avatar from "../../../public/member.png";

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

const Form = styled.form``;
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
  background-color: transparent;
  padding: 10px;
  font-size: 18px;
`;

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
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
  "header",
  "font",
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
  return (
    <Wrapper>
      <ArticleUser>
        <UserAvatarWrapper>
          <Image src={Avatar} alt="avatar" fill sizes="contain" />
        </UserAvatarWrapper>
        <UserName>Tom</UserName>
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
          style={{ height: "360px", marginBottom: "80px" }}
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="瑜伽相關的任何問題都非常歡迎大家提問唷～"
          modules={modules}
          formats={formats}
        />
        <Button>發文</Button>
      </Form>
    </Wrapper>
  );
}

export default Post;
