import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styled from "styled-components";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import produce from "immer";
import { db } from "../../../../lib/firebase";
import { AuthContext } from "../../../contexts/authContext";
import "react-quill/dist/quill.snow.css";
import Avatar from "../../../../public/member.png";
import LikeIcon from "../../../../public/like.png";
import MessageIcon from "../../../../public/message.png";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 50px;
  min-height: calc(100vh - 136px - 58px);
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
const UserName = styled.p`
  font-size: 20px;
`;

const Title = styled.h2`
  font-size: 30px;
  margin-bottom: 20px;
  font-weight: bold;
`;
const PostTime = styled.p`
  margin-bottom: 20px;
`;
const ArticleContainer = styled.div`
  border: 1px solid gray;
  padding: 10px;
  margin-bottom: 30px;
`;
const Content = styled.div`
  margin-bottom: 20px;
  ol {
    display: block;
    list-style-type: decimal;
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 0;
    margin-right: 0;
    padding-left: 40px;
  }
  ul {
    display: block;
    list-style-type: disc;
    margin-top: 1em;
    margin-bottom: 1 em;
    margin-left: 0;
    margin-right: 0;
    padding-left: 40px;
  }
  li {
    display: list-item;
  }
  blockquote {
    margin: 20px;
    padding: 10px;
    background-color: #eeeeee;
    border-left: 5px solid #00aae1;
    margin: 15px 30px 0 10px;
    padding-left: 20px;
    border-radius: 6px;
  }
  img {
    margin: 10px auto;
  }
`;
const ArticleActivity = styled.div`
  display: flex;
  padding-left: 15px;
  margin-bottom: 10px;
`;
const IconWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;
const ActivityQty = styled.span`
  margin-right: 20px;
  font-size: 20px;
`;

const MessagesContainer = styled.div`
  background-color: #bbb8b8;
  padding-top: 10px;
  width: 100%;
`;
const Messages = styled.ul``;
const MessageQty = styled.p`
  padding: 5px;
  border-bottom: 2px solid gray;
  margin-bottom: 20px;
`;
const Message = styled.li`
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid green;
`;

const MessageAuthor = styled.div`
  display: flex;
  margin-bottom: 15px;
`;
const MessageAuthorTeacher = styled(MessageAuthor)`
  cursor: pointer;
`;

const MessageContent = styled.p`
  margin-bottom: 20px;
`;
const MessageInfo = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const MessageTime = styled.p`
  margin-right: 20px;
`;
const MessageFloor = styled.p``;
const MessageBlock = styled.div`
  display: flex;
  width: 100%;
`;
const MessageTextArea = styled.textarea`
  resize: none;
  flex-basis: 90%;
`;
const Button = styled.button`
  background-color: transparent;
  padding: 5px;
  flex-basis: 10%;
`;

interface MessageInterface {
  time: string | number;
  message: string;
  authorId: string;
  authorName: string;
  identity: string;
  avatar?: string;
  like: number;
}
interface ArticleInterface {
  time: string;
  title: string;
  authorId: string;
  authorName: string;
  content: string;
  messages: MessageInterface[];
}

function Article() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<ArticleInterface>({
    time: "",
    title: "",
    authorId: "",
    authorName: "",
    content: "",
    messages: [],
  });
  const [inputMessage, setInputMessage] = useState("");
  const { userData, isLogin } = useContext(AuthContext);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const getArticle = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const authorId: string = docSnap.data().author;
      const userRef = doc(db, "users", authorId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const messages = docSnap.data().messages as MessageInterface[];
      if (messages) {
        await Promise.all(
          messages?.map(async (message, index) => {
            const messageAuthorId = message.authorId;
            const messageAuthorRef = doc(db, "users", messageAuthorId);
            const messageAuthorSnap = await getDoc(messageAuthorRef);
            if (messageAuthorSnap.exists()) {
              messages[index].authorName = messageAuthorSnap.data().username;
              messages[index].identity = messageAuthorSnap.data().identity;
            }
          })
        );
      }
      const datas: ArticleInterface = {
        time: docSnap.data().time,
        title: docSnap.data().title,
        authorId: docSnap.data().author,
        content: docSnap.data().content,
        messages: messages || [],
        authorName: userSnap.data().username,
      };
      setArticle(datas);
    };
    getArticle();
  }, [id]);

  const handleMessage = async () => {
    if (!isLogin) {
      alert("登入後才能留言唷！");
      return;
    }
    if (!inputMessage.trim()) {
      alert("請輸入內容");
      return;
    }
    if (typeof id !== "string") return;
    const articleRef = doc(db, "posts", id);
    await updateDoc(articleRef, {
      messages: arrayUnion({
        authorId: userData.uid,
        time: Date.now(),
        message: inputMessage,
        like: 0,
      }),
    });
    setInputMessage("");
    setArticle(
      produce((draft) => {
        draft.messages.push({
          authorId: userData.uid,
          authorName: userData.username,
          identity: userData.identity,
          time: Date.now(),
          message: inputMessage,
          like: 0,
        });
      })
    );
  };

  return (
    <Wrapper>
      <ArticleUser>
        <UserAvatarWrapper>
          <Image src={Avatar} alt="avatar" fill sizes="contain" />
        </UserAvatarWrapper>
        <UserName>{article?.authorName}</UserName>
      </ArticleUser>
      <Title>{article?.title}</Title>
      {article && <PostTime>{new Date(article.time).toLocaleString()}</PostTime>}
      {article && (
        <ArticleContainer>
          {/* eslint-disable-next-line react/no-danger */}
          <Content className="ql-editor" dangerouslySetInnerHTML={{ __html: article.content }} />
          <ArticleActivity>
            <IconWrapper>
              <Image src={LikeIcon} alt="like" fill sizes="contain" />
            </IconWrapper>
            <ActivityQty>0</ActivityQty>
            <IconWrapper>
              <Image src={MessageIcon} alt="like" fill sizes="contain" />
            </IconWrapper>
            <ActivityQty>{article?.messages?.length || 0}</ActivityQty>
          </ArticleActivity>
        </ArticleContainer>
      )}

      {article && article?.messages?.length > 0 && (
        <MessagesContainer>
          <Messages>
            <MessageQty>共 {article?.messages.length} 則留言</MessageQty>
            {Array.isArray(article.messages) &&
              article.messages.map((message: MessageInterface, index) => (
                <Message key={message.authorId + new Date(message.time).toLocaleString()}>
                  {message.identity === "student" && (
                    <MessageAuthor>
                      <UserAvatarWrapper>
                        <Image src={Avatar} alt="avatar" />
                      </UserAvatarWrapper>
                      <UserName>
                        {message.authorName} (學生)
                        {message.authorId === article.authorId && " - 原PO"}
                      </UserName>
                    </MessageAuthor>
                  )}
                  {message.identity === "teacher" && (
                    <MessageAuthorTeacher
                      onClick={() => {
                        router.push(`/findTeachers/reserve/${message.authorId}`);
                      }}
                    >
                      <UserAvatarWrapper>
                        <Image src={Avatar} alt="avatar" />
                      </UserAvatarWrapper>
                      <UserName>
                        {message.authorName} (老師)
                        {message.authorId === article.authorId && " - 原PO"}
                      </UserName>
                    </MessageAuthorTeacher>
                  )}
                  <MessageContent>{message.message}</MessageContent>
                  <MessageInfo>
                    <MessageTime>{new Date(message.time).toLocaleString()}</MessageTime>
                    <MessageFloor>B{index + 1}</MessageFloor>
                  </MessageInfo>
                </Message>
              ))}
          </Messages>
        </MessagesContainer>
      )}
      <MessageBlock>
        <MessageTextArea
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
          }}
        />
        <Button onClick={handleMessage}>送出</Button>
      </MessageBlock>
    </Wrapper>
  );
}

export default Article;
