import React, { useState, useContext, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import Image from "next/image";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import ReactQuill, { ReactQuillProps } from "react-quill";
import Avatar from "../../../public/member.png";
import { db, storage } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import "react-quill/dist/quill.snow.css";

interface EditorInterface extends ReactQuillProps {
  forwardedRef: React.RefObject<ReactQuill>;
}

/* eslint-disable react/display-name */
const Editor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    /* eslint-disable-next-line func-names */
    return function ({ forwardedRef, ...props }: EditorInterface) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
  }
);

const Wrapper = styled.div`
  background-color: #f1ead8;
  min-height: calc(100vh - 182px);
  padding: 20px 0;
`;

const Container = styled.div`
  max-width: 810px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
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
  color: #fff;
  background-color: #5d7262;
  border-radius: 5px;
  padding: 10px;
  font-size: 18px;
  margin: 0 auto;
  cursor: pointer;
`;

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
  const quillRef = useRef<ReactQuill>(null);

  const handlePost = async () => {
    if (!title.trim()) {
      alert("請輸入標題");
    }
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

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = () => {
      const { files } = input;
      if (!files) return;
      const file = files[0];
      const storageRef = ref(storage, `article/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          alert(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          /* eslint-disable @typescript-eslint/no-unsafe-member-access */
          /* eslint-disable @typescript-eslint/no-unsafe-call */
          const quillEditor = quillRef?.current?.editor;
          const range = quillRef?.current?.selection;
          if (!range) return;
          const { index } = range;
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          quillEditor?.insertEmbed(index + 1, "image", downloadUrl);
        }
      );
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  return (
    <Wrapper>
      <Container>
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
            forwardedRef={quillRef}
          />
          <Button onClick={handlePost} type="button">
            發問
          </Button>
        </Form>
      </Container>
    </Wrapper>
  );
}

export default Post;
