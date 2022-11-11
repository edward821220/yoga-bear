import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styled from "styled-components";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import "react-quill/dist/quill.snow.css";
import Avatar from "../../../../public/member.png";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 50px;
  min-height: calc(100vh - 127.6167px - 58px);
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
const Content = styled.div`
  border: 1px solid gray;
  padding: 10px;
  margin-bottom: 30px;
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

const MessagesContainer = styled.div`
  background-color: #bbb8b8;
  width: 100%;
  border: 2px solid red;
`;
const Messages = styled.ul``;
const Message = styled.li``;
const MessageBlock = styled.div`
  position: fixed;
  display: flex;
  bottom: 58.2px;
  width: 800px;
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
      {/* eslint-disable-next-line react/no-danger */}
      {article && <Content className="ql-editor" dangerouslySetInnerHTML={{ __html: article.content }} />}
      <MessagesContainer>
        <Messages>
          <Message />
        </Messages>
        <MessageBlock>
          <MessageTextArea />
          <Button>送出</Button>
        </MessageBlock>
      </MessagesContainer>
    </Wrapper>
  );
}

export default Article;
