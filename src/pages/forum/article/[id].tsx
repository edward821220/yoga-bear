import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styled from "styled-components";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
`;
const PostTime = styled.p`
  margin-bottom: 10px;
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

function Article() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Record<string, string>>();
  const [inputMessage, setInputMessage] = useState("");
  const { userData } = useContext(AuthContext);
  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const getArticle = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const authorId: string = docSnap.data().author;
        const userRef = doc(db, "users", authorId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setArticle({ ...docSnap.data(), authorName: userSnap.data().username });
        }
      }
    };
    getArticle();
  }, [id]);

  const handleMessage = async () => {
    if (!inputMessage.trim()) {
      alert("請輸入內容");
    }
    if (typeof id !== "string") return;
    const articleRef = doc(db, "posts", id);
    await updateDoc(articleRef, {
      messages: arrayUnion({ author: userData.uid, time: Date.now(), message: inputMessage }),
    });
    alert("您已成功留言！");
    setInputMessage("");
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
      {article && (
        <PostTime>{`${new Date(article.time).toLocaleDateString()} ${new Date(article.time).getHours()}:${new Date(
          article.time
        ).getMinutes()}`}</PostTime>
      )}
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
            <ActivityQty>0</ActivityQty>
          </ArticleActivity>
        </ArticleContainer>
      )}

      {article && article.messages.length > 0 && (
        <MessagesContainer>
          <Messages>
            <MessageQty>共{article.messages.length}則留言</MessageQty>
            {Array.isArray(article.messages) &&
              article.messages.map((message: { author: string; time: string; message: string }, index) => (
                <Message key={message.author + message.time}>
                  <MessageAuthor>
                    <UserAvatarWrapper>O</UserAvatarWrapper>
                    <UserName>OOO</UserName>
                  </MessageAuthor>
                  <MessageContent>{message.message}</MessageContent>
                  <MessageInfo>
                    <MessageTime>{new Date(message.time).toLocaleString()}</MessageTime>
                    <MessageFloor>B{index + 1}</MessageFloor>
                  </MessageInfo>
                </Message>
              ))}
          </Messages>
          <MessageBlock>
            <MessageTextArea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
            />
            <Button onClick={handleMessage}>送出</Button>
          </MessageBlock>
        </MessagesContainer>
      )}
    </Wrapper>
  );
}

export default Article;
