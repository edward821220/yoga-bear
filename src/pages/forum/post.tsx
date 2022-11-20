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
import Bear from "../../../public/Yoga-Bear.png";
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
  margin-right: 20px;
`;
const UserName = styled.span`
  font-size: 24px;
  line-height: 66px;
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
`;
const BearWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 60px;
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
  const { isLogin, userData } = useContext(AuthContext);
  const router = useRouter();
  const quillRef = useRef<ReactQuill>(null);

  const handlePost = async () => {
    if (!isLogin) {
      alert("登入後才能發問唷！");
      return;
    }
    if (!title.trim()) {
      alert("請輸入標題");
      return;
    }
    if (!content.trim()) {
      alert("請輸入內容");
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
            <Image src={userData.avatar || Avatar} alt="avatar" fill sizes="contain" />
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
            modules={modules}
            formats={formats}
            forwardedRef={quillRef}
          />
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
  );
}

export default Post;
