import React, { useState, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter, NextRouter } from "next/router";
import styled from "styled-components";
import Swal from "sweetalert2";
import parse from "html-react-parser";
import { useRecoilState, SetterOrUpdater } from "recoil";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import produce from "immer";
import Editor from "../../../components/editor/editor";
import { db } from "../../../../lib/firebase";
import { AuthContext } from "../../../contexts/authContext";
import { showMemberModalState } from "../../../../lib/recoil";
import Avatar from "../../../../public/member.png";
import LikeQtyIcon from "../../../../public/like.png";
import MessageIcon from "../../../../public/message.png";
import LikeBlankIcon from "../../../../public/favorite-blank.png";
import LikeIcon from "../../../../public/favorite.png";
import Remove from "../../../../public/trash.png";
import Save from "../../../../public/save.png";
import Edit from "../../../../public/edit.png";
import "react-quill/dist/quill.snow.css";
import RichEditor from "../../../components/editor/richEditor";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  padding: 20px 0;
  @media screen and (max-width: 888px) {
    padding: 10px 5px;
  }
`;

const Container = styled.div`
  color: ${(props) => props.theme.colors.color2};
  max-width: 800px;
  margin: 0 auto;
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.color1};
  .quill {
    margin: 30px 5px;
    min-height: 400px;
    height: 100%;
    * {
      border: none;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
  }
  .ql-toolbar {
    border-bottom: 1px solid lightgray;
  }
`;

const ArticleUser = styled.div`
  display: flex;
  margin: 20px 25px;
`;
const UserAvatarWrapper = styled.div<{ identity?: string }>`
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border-radius: 50%;
  overflow: hidden;
  cursor: ${(props) => props.identity === "teacher" && "pointer"};
`;
const UserName = styled.p`
  font-size: 20px;
  margin-right: auto;
`;

const Title = styled.h2`
  font-size: 30px;
  font-weight: bold;
  margin: 20px 25px;
  word-wrap: break-word;
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
  word-wrap: break-word;
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
const Qty = styled.div`
  display: flex;
`;
const ClickLike = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;
const ClickIconWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  cursor: pointer;
`;
const ActivityQty = styled.span`
  margin-right: 20px;
  font-size: 20px;
`;

const MessagesContainer = styled.div`
  background-color: ${(props) => props.theme.colors.color8};
  padding: 10px 0px;
  width: 100%;
`;
const Messages = styled.ul`
  max-width: 100%;
`;
const MessageQty = styled.p`
  padding: 5px 5px 10px 20px;
  border-bottom: 1px solid #e7daca;
  margin: 0 10px 10px 10px;
`;
const Message = styled.li`
  border-bottom: 1px solid #e7daca;
  margin: 0px 10px 10px 10px;
  padding: 10px 20px;
  max-width: 100%;
`;

const MessageAuthor = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const MessageContent = styled.div`
  margin-bottom: 20px;
  max-width: 100%;
  word-wrap: break-word;
  p {
    line-height: 24px;
  }
`;
const MessageInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  line-height: 24px;
`;
const MessageTime = styled.p`
  margin-right: 20px;
  margin-left: 20px;
`;
const LikeQty = styled.span`
  line-height: 24px;
`;
const MessageFloor = styled.p``;
const MessageBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 5px;
  .quill {
    flex-basis: 90%;
    max-width: 90%;
    min-height: 0;
    height: 60px;
    border-radius: 5px;
    border: none;
    margin: 0;
    &:focus {
      outline: none;
    }
    @media screen and (max-width: 555px) {
      flex-basis: 80%;
    }
    .ql-editor {
      padding: 0;
      max-width: 100%;
      overflow-x: hidden;
    }
  }
`;

const Button = styled.button`
  flex-basis: 8%;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  height: 40px;
  padding: 5px;
  cursor: pointer;
  @media screen and (max-width: 555px) {
    flex-basis: 15%;
  }
`;

interface MessageInterface {
  time: string | number;
  message: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  identity: string;
  likes: string[];
}
interface ArticleInterface {
  time: string;
  title: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content?: string;
  messages: MessageInterface[];
  likes: string[];
}

interface MessagesSectionPropsInterface {
  id: string;
  article: ArticleInterface;
  setArticle: React.Dispatch<React.SetStateAction<ArticleInterface>>;
  setShowMemberModal: SetterOrUpdater<boolean>;
  isLogin: boolean;
  userData: {
    uid: string;
    email: string;
    identity: string;
    username: string;
    avatar: string;
  };
  router: NextRouter;
}
function MessagesSection({
  id,
  article,
  setArticle,
  setShowMemberModal,
  isLogin,
  userData,
  router,
}: MessagesSectionPropsInterface) {
  const [inputMessage, setInputMessage] = useState("");
  const handleLikeMessage = (index: number) => {
    if (!isLogin) {
      Swal.fire({ title: "登入後才能按讚唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      setShowMemberModal(true);
      return;
    }
    const updatedArticle = produce(article, (draft) => {
      draft.messages[index].likes.push(userData.uid);
    });
    setArticle(updatedArticle);
    const articleRef = doc(db, "posts", id);
    updateDoc(articleRef, { messages: updatedArticle.messages });
  };

  const handleDislikeMessage = (index: number) => {
    const updatedArticle = produce(article, (draft) => {
      draft.messages[index].likes.splice(draft.messages[index].likes.indexOf(userData.uid), 1);
    });
    setArticle(updatedArticle);
    const articleRef = doc(db, "posts", id);
    updateDoc(articleRef, { messages: updatedArticle.messages });
  };

  const handleMessage = async () => {
    if (!isLogin) {
      Swal.fire({ title: "登入後才能留言唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      setShowMemberModal(true);
      return;
    }
    if (!inputMessage.trim()) {
      Swal.fire({ title: "請輸入內容！", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
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
          authorAvatar: userData.avatar,
          identity: userData.identity,
          time: Date.now(),
          message: inputMessage,
          likes: [],
        });
      })
    );
  };
  return (
    <>
      {article && article?.messages?.length > 0 && (
        <MessagesContainer>
          <Messages>
            <MessageQty>共 {article?.messages.length} 則留言</MessageQty>
            {Array.isArray(article.messages) &&
              article.messages.map((message: MessageInterface, index) => (
                <Message key={message.authorId + new Date(message.time).toLocaleString()}>
                  <MessageAuthor>
                    <UserAvatarWrapper
                      identity={message.identity}
                      onClick={() => {
                        if (message.identity === "teacher") {
                          if (!isLogin) {
                            Swal.fire({
                              title: "請先登入才能預約老師唷！",
                              confirmButtonColor: "#5d7262",
                              icon: "warning",
                            });
                            setShowMemberModal(true);
                            return;
                          }
                          router.push(`/findTeachers/reserve/${message.authorId}`);
                        }
                      }}
                    >
                      <Image
                        src={message.authorAvatar || Avatar}
                        alt="avatar"
                        fill
                        sizes="contain"
                        style={{ objectFit: "cover" }}
                      />
                    </UserAvatarWrapper>
                    <UserName>
                      {message.authorName} ({message.identity === "student" ? "學生" : "老師"})
                      {message.authorId === article.authorId && " - 原PO"}
                    </UserName>
                    {userData.uid === message.authorId && (
                      <ClickIconWrapper
                        style={{ marginRight: 0, width: "20px", cursor: "pointer" }}
                        onClick={() => {
                          Swal.fire({
                            text: `確定要刪除留言嗎？`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#3085d6",
                            confirmButtonText: "Yes!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              const newMessages = article.messages.filter((_, messageIndex) => messageIndex !== index);
                              setArticle(
                                produce((draft) => {
                                  // eslint-disable-next-line no-param-reassign
                                  draft.messages = newMessages;
                                })
                              );
                              const articleRef = doc(db, "posts", id);
                              updateDoc(articleRef, {
                                messages: newMessages,
                              });
                            }
                          });
                        }}
                      >
                        <Image src={Remove} alt="remove" />
                      </ClickIconWrapper>
                    )}
                  </MessageAuthor>
                  <MessageContent>{parse(message.message)}</MessageContent>
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
                          <Image src={LikeIcon} alt="like-clicked" fill sizes="contain" />
                        </IconWrapper>
                        <LikeQty>{message?.likes?.length || 0}</LikeQty>
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
        <Editor content={inputMessage} setContent={setInputMessage} placeholder="留言......" />
        <Button onClick={handleMessage}>送出</Button>
      </MessageBlock>
    </>
  );
}

function Article({ id, articleData }: { id: string; articleData: ArticleInterface }) {
  const { time, title, authorId, authorName, authorAvatar, content: articleContent, messages, likes } = articleData;
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
  const [article, setArticle] = useState({ time, title, authorId, authorName, authorAvatar, messages, likes });
  const [content, setContent] = useState<string>(articleContent || "");
  const [isEditState, setIsEditState] = useState(false);
  const { userData, isLogin } = useContext(AuthContext);

  const handleLikeArticle = async () => {
    if (!isLogin) {
      Swal.fire({ title: "登入後才能按讚唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      setShowMemberModal(true);
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
    setArticle(
      produce((draft: ArticleInterface) => {
        draft.likes.splice(draft.likes.indexOf(userData.uid), 1);
      })
    );
    const articleRef = doc(db, "posts", id);
    await updateDoc(articleRef, { likes: arrayRemove(userData.uid) });
  };

  return (
    <>
      <Head>
        <title>{article.title} - Yoga Bear</title>
      </Head>
      <Wrapper>
        <Container>
          <ArticleUser>
            <UserAvatarWrapper>
              <Image
                src={article?.authorAvatar || Avatar}
                alt="avatar"
                fill
                sizes="contain"
                style={{ objectFit: "cover" }}
              />
            </UserAvatarWrapper>
            <UserName>{article?.authorName}</UserName>
            {userData.uid === article.authorId && (
              <>
                {isEditState || (
                  <ClickIconWrapper
                    onClick={() => {
                      setIsEditState(true);
                    }}
                  >
                    <Image src={Edit} alt="edit" />
                  </ClickIconWrapper>
                )}
                {isEditState && (
                  <ClickIconWrapper
                    onClick={async () => {
                      const postRef = doc(db, "posts", id);
                      await updateDoc(postRef, {
                        content,
                      });
                      setIsEditState(false);
                    }}
                  >
                    <Image src={Save} alt="save" />
                  </ClickIconWrapper>
                )}
                <ClickIconWrapper
                  onClick={() => {
                    Swal.fire({
                      text: `確定要刪除文章嗎？`,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Yes!",
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        const articleRef = doc(db, "posts", id);
                        await deleteDoc(articleRef);
                        router.push("/forum");
                      }
                    });
                  }}
                >
                  <Image src={Remove} alt="remove" />
                </ClickIconWrapper>
              </>
            )}
          </ArticleUser>
          <Title>{article?.title}</Title>
          {article && <PostTime>{new Date(article.time).toLocaleString()}</PostTime>}
          {isEditState && <RichEditor content={content} setContent={setContent} />}
          {article && !isEditState && (
            <ArticleContainer>
              {typeof content === "string" && <Content className="ql-editor">{parse(content)}</Content>}
              <ArticleActivity>
                <Qty>
                  <IconWrapper>
                    <Image src={LikeQtyIcon} alt="like" fill sizes="contain" />
                  </IconWrapper>
                  <ActivityQty>{article?.likes?.length || 0}</ActivityQty>
                  <IconWrapper>
                    <Image src={MessageIcon} alt="like" fill sizes="contain" />
                  </IconWrapper>
                  <ActivityQty>{article?.messages?.length || 0}</ActivityQty>
                </Qty>
                {article?.likes?.includes(userData.uid) || (
                  <ClickLike onClick={handleLikeArticle}>
                    <IconWrapper>
                      <Image src={LikeBlankIcon} alt="like-click" fill sizes="contain" />
                    </IconWrapper>
                  </ClickLike>
                )}
                {article?.likes?.includes(userData.uid) && (
                  <ClickLike onClick={handleDislikeArticle}>
                    <IconWrapper>
                      <Image src={LikeIcon} alt="like-clicked" fill sizes="contain" />
                    </IconWrapper>
                  </ClickLike>
                )}
              </ArticleActivity>
            </ArticleContainer>
          )}
          {!isEditState && (
            <MessagesSection
              id={id}
              article={article}
              setArticle={setArticle}
              setShowMemberModal={setShowMemberModal}
              isLogin={isLogin}
              userData={userData}
              router={router}
            />
          )}
        </Container>
      </Wrapper>
    </>
  );
}

export default Article;

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const docRef = doc(db, "posts", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const authorId = docSnap.data().author as string;
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
          const authorName = messageAuthorSnap.data().username as string;
          const authorAvatar = messageAuthorSnap.data().photoURL as string;
          const identity = messageAuthorSnap.data().identity as string;
          messages[index].authorName = authorName;
          messages[index].authorAvatar = authorAvatar || "";
          messages[index].identity = identity;
        }
      })
    );
  }

  const articleData: ArticleInterface = {
    time: docSnap.data().time as string,
    title: docSnap.data().title as string,
    authorId: docSnap.data().author as string,
    content: docSnap.data().content as string,
    messages: messages || [],
    authorName: userSnap.data().username as string,
    authorAvatar: userSnap.data().photoURL as string,
    likes: (docSnap.data().likes as string[]) || [],
  };

  return { props: { id: params.id, articleData } };
}
