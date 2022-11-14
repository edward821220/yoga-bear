import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styled from "styled-components";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import produce from "immer";
import { db } from "../../../../lib/firebase";
import { AuthContext } from "../../../contexts/authContext";
import "react-quill/dist/quill.snow.css";
import Avatar from "../../../../public/member.png";
import LikeQtyIcon from "../../../../public/like.png";
import MessageIcon from "../../../../public/message.png";
import LikeBlankIcon from "../../../../public/favorite-blank.png";
import LikeIcon from "../../../../public/favorite.png";

const Wrapper = styled.div`
  background-color: #f1ead8;
  min-height: calc(100vh - 182px);
  padding: 20px 0;
`;

const Container = styled.div`
  color: #654116;
  max-width: 800px;
  margin: 0 auto;
  border: 2px solid #654116;
  border-radius: 5px;
  background-color: #fff;
`;

const ArticleUser = styled.div`
  display: flex;
  margin: 20px 25px;
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
  font-weight: bold;
  margin: 20px 25px;
`;
const PostTime = styled.p`
  margin: 10px 25px;
`;
const ArticleContainer = styled.div`
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
    margin: 20px auto;
  }
`;

const ArticleActivity = styled.div`
  display: flex;
  padding-left: 15px;
  margin-bottom: 10px;
  justify-content: space-between;
`;
const Qtys = styled.div`
  display: flex;
`;
const ClickLike = styled.div`
  display: flex;
  position: relative;
  cursor: pointer;
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
  background-color: #eceae6;
  padding: 10px 0px;
  width: 100%;
`;
const Messages = styled.ul``;
const MessageQty = styled.p`
  padding: 5px 5px 10px 20px;
  border-bottom: 2px solid #e7daca;
  margin: 0 10px 10px 10px;
`;
const Message = styled.li`
  border-bottom: 2px solid #e7daca;
  margin: 0px 10px 10px 10px;
  padding: 10px 20px;
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
  margin-left: 20px;
`;
const MessageFloor = styled.p``;
const MessageBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 5px;
`;
const MessageTextArea = styled.textarea`
  resize: none;
  flex-basis: 90%;
  height: 50px;
  border-radius: 5px;
  border: none;
  &:focus {
    outline: none;
  }
`;
const Button = styled.button`
  flex-basis: 8%;
  color: #fff;
  background-color: #5d7262;
  border-radius: 5px;
  height: 40px;
  padding: 5px;
  cursor: pointer;
`;

interface MessageInterface {
  time: string | number;
  message: string;
  authorId: string;
  authorName: string;
  identity: string;
  avatar?: string;
  likes: string[];
}
interface ArticleInterface {
  time: string;
  title: string;
  authorId: string;
  authorName: string;
  content: string;
  messages: MessageInterface[];
  likes: string[];
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
    likes: [],
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
        likes: docSnap.data().likes || [],
      };
      setArticle(datas);
    };
    getArticle();
  }, [id]);

  const handleLikeArticle = async () => {
    if (typeof id !== "string") return;
    if (!isLogin) {
      alert("登入後才能按讚唷！");
      return;
    }
    setArticle(
      produce((draft: ArticleInterface) => {
        draft.likes.push(userData.uid);
      })
    );
    const articleRef = doc(db, "posts", id);
    await updateDoc(articleRef, { likes: arrayUnion(userData.uid) });
  };

  const handleDislikeArticle = async () => {
    if (typeof id !== "string") return;
    setArticle(
      produce((draft: ArticleInterface) => {
        draft.likes.splice(draft.likes.indexOf(userData.uid), 1);
      })
    );
    const articleRef = doc(db, "posts", id);
    await updateDoc(articleRef, { likes: arrayRemove(userData.uid) });
  };

  const handleLikeMessage = (index: number) => {
    if (typeof id !== "string") return;
    if (!isLogin) {
      alert("登入後才能按讚唷！");
      return;
    }
    setArticle(
      produce((draft: ArticleInterface) => {
        draft.messages[index].likes.push(userData.uid);
        const articleRef = doc(db, "posts", id);
        updateDoc(articleRef, { messages: draft.messages });
      })
    );
  };

  const handleDislikeMessage = (index: number) => {
    if (typeof id !== "string") return;
    setArticle(
      produce((draft: ArticleInterface) => {
        draft.messages[index].likes.splice(draft.messages[index].likes.indexOf(userData.uid), 1);
        const articleRef = doc(db, "posts", id);
        updateDoc(articleRef, { messages: draft.messages });
      })
    );
  };

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
        likes: [],
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
          likes: [],
        });
      })
    );
  };

  return (
    <Wrapper>
      <Container>
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
              <Qtys>
                <IconWrapper>
                  <Image src={LikeQtyIcon} alt="like" fill sizes="contain" />
                </IconWrapper>
                <ActivityQty>{article?.likes?.length || 0}</ActivityQty>
                <IconWrapper>
                  <Image src={MessageIcon} alt="like" fill sizes="contain" />
                </IconWrapper>
                <ActivityQty>{article?.messages?.length || 0}</ActivityQty>
              </Qtys>
              {article.likes.includes(userData.uid) || (
                <ClickLike onClick={handleLikeArticle}>
                  <IconWrapper>
                    <Image src={LikeBlankIcon} alt="like-click" fill sizes="contain" />
                  </IconWrapper>
                </ClickLike>
              )}
              {article.likes.includes(userData.uid) && (
                <ClickLike onClick={handleDislikeArticle}>
                  <IconWrapper>
                    <Image src={LikeIcon} alt="like-cliked" fill sizes="contain" />
                  </IconWrapper>
                </ClickLike>
              )}
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
                      {message?.likes?.includes(userData.uid) || (
                        <ClickLike
                          onClick={() => {
                            handleLikeMessage(index);
                          }}
                        >
                          <IconWrapper>
                            <Image src={LikeBlankIcon} alt="like-click" fill sizes="contain" />
                          </IconWrapper>
                          <span>{message?.likes?.length || 0}</span>
                        </ClickLike>
                      )}
                      {message?.likes?.includes(userData.uid) && (
                        <ClickLike
                          onClick={() => {
                            handleDislikeMessage(index);
                          }}
                        >
                          <IconWrapper>
                            <Image src={LikeIcon} alt="like-cliked" fill sizes="contain" />
                          </IconWrapper>
                          <span>{message?.likes?.length || 0}</span>
                        </ClickLike>
                      )}
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
            placeholder="留言......"
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
          />
          <Button onClick={handleMessage}>送出</Button>
        </MessageBlock>
      </Container>
    </Wrapper>
  );
}

export default Article;
