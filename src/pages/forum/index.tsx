import Image from "next/image";
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import BannerPic from "../../../public/banner0.jpeg";
import LikeIcon from "../../../public/like.png";
import MessageIcon from "../../../public/message.png";
import Avatar from "../../../public/member.png";
import { db } from "../../../lib/firebase";
import { AuthContext } from "../../contexts/authContext";
import { showMemberModalState } from "../../../lib/recoil";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
`;
const Banner = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  max-height: 400px;
  margin-bottom: 20px;
  overflow: hidden;
`;
const BannerImage = styled(Image)`
  height: auto;
  width: 100%;
  transform: translate(0, -30%);
  @media screen and (max-width: 788px) {
    transform: translate(0, -20%);
  }
  @media screen and (max-width: 666px) {
    transform: translate(0, -10%);
  }
`;
const Container = styled.div`
  max-width: 1096px;
  margin: 0 auto;
  display: flex;
  padding: 0 10px 20px 10px;
  @media screen and (max-width: 1066px) {
    flex-wrap: wrap;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
  }
`;
const Main = styled.main`
  flex-basis: 70%;
  margin-right: 10px;
  @media screen and (max-width: 1066px) {
    width: 80%;
  }
`;
const Aside = styled.div`
  flex-basis: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  height: 300px;
  border: 1px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  padding: 0 10px;
  @media screen and (max-width: 1066px) {
    flex-basis: 0;
    width: 40%;
    min-width: 320px;
    padding: 20px 10px;
    margin-bottom: 20px;
  }
`;
const AsideTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;
const AsideContent = styled.p`
  margin-bottom: 30px;
  line-height: 24px;
`;
const Button = styled.button`
  display: block;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  width: 120px;
  padding: 10px;
  margin: 0 auto;
  cursor: pointer;
`;
const Articles = styled.ul`
  background-color: ${(props) => props.theme.colors.color8};
`;

const Article = styled.li`
  color: ${(props) => props.theme.colors.color2};
  border-bottom: 1px solid #e7daca;
  padding: 35px 20px;
  min-height: 200px;
  cursor: pointer;
`;
const ArticleUser = styled.div`
  display: flex;
  margin-bottom: 15px;
`;
const UserAvatarWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 5px;
`;
const UserName = styled.span`
  font-size: 20px;
  line-height: 36px;
`;
const ArticleInfo = styled.div`
  display: flex;
`;
const ArticleText = styled.div`
  flex-basis: 75%;
  margin-right: 10px;
  overflow: hidden;
`;
const PicPreview = styled.div`
  position: relative;
  flex-basis: 25%;
  img {
    width: 160px;
    height: 90px;
  }
`;

const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: bolder;
  margin-bottom: 10px;
  width: 100%;
  overflow: hidden;
`;
const ArticlePreview = styled.div`
  line-height: 20px;
  width: 500px;
  height: 24px;
  margin-bottom: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
`;
const OtherInfos = styled.div`
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 444px) {
    flex-wrap: wrap;
  }
`;
const ArticleTime = styled.p``;
const ArticleActivity = styled.div`
  display: flex;
  @media screen and (max-width: 444px) {
    margin-bottom: 10px;
  }
`;
const IconWrapper = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;
const ActivityQty = styled.span`
  margin-right: 10px;
  font-size: 14px;
`;

interface PostInterface {
  id: string;
  time: string;
  title: string;
  content: string;
  preview?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  picPreview?: string;
  messages?: [];
  messagesQty: number;
  likes?: [];
  likesQty: number;
}

function Forum() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
  const { isLogin } = useContext(AuthContext);

  useEffect(() => {
    const getPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("time", "desc"));
      const querySnapshot = await getDocs(q);
      const results: PostInterface[] = querySnapshot.docs.map((data) => {
        const article = data.data() as PostInterface;
        const images = article?.content?.match(/<img.*?>/g);
        const paragraphs = article?.content?.match(/<p>.*?<\/p>/g);
        const messagesQty = article?.messages?.length || 0;
        const likesQty = article?.likes?.length || 0;
        let preview = "";
        let picPreview = "";
        if (paragraphs) preview = `${paragraphs[0].slice(3, -4)}...`;
        if (images) [picPreview] = images;
        return {
          id: data.data().id,
          time: new Date(data.data().time as string).toLocaleString(),
          title: data.data().title,
          content: data.data().content,
          authorId: data.data().author,
          preview,
          picPreview,
          messagesQty,
          likesQty,
        };
      });
      await Promise.all(
        results.map(async (result: PostInterface, index) => {
          const docRef = doc(db, "users", result.authorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            results[index].authorName = docSnap.data().username;
            results[index].authorAvatar = docSnap.data().photoURL;
          }
        })
      );
      setPosts(results);
    };
    getPosts();
  }, []);
  return (
    <Wrapper>
      <Banner>
        <BannerImage src={BannerPic} alt="banner" />
      </Banner>
      <Container>
        <Main>
          <Articles>
            {posts.map((article) => (
              <Article
                key={article.id}
                onClick={() => {
                  router.push(`/forum/article/${article.id}`);
                }}
              >
                <ArticleUser>
                  <UserAvatarWrapper>
                    <Image src={article.authorAvatar || Avatar} alt="avatar" fill sizes="contain" />
                  </UserAvatarWrapper>
                  <UserName>{article.authorName}</UserName>
                </ArticleUser>
                <ArticleInfo>
                  <ArticleText>
                    <ArticleTitle>{article.title}</ArticleTitle>
                    {article.preview && <ArticlePreview dangerouslySetInnerHTML={{ __html: article?.preview }} />}
                  </ArticleText>
                  {article.picPreview && <PicPreview dangerouslySetInnerHTML={{ __html: article?.picPreview }} />}
                </ArticleInfo>
                <OtherInfos>
                  <ArticleActivity>
                    <IconWrapper>
                      <Image src={LikeIcon} alt="like" fill sizes="contain" />
                    </IconWrapper>
                    <ActivityQty>{article.likesQty}</ActivityQty>
                    <IconWrapper>
                      <Image src={MessageIcon} alt="like" fill sizes="contain" />
                    </IconWrapper>
                    <ActivityQty>{article.messagesQty}</ActivityQty>
                  </ArticleActivity>
                  <ArticleTime>{article.time}</ArticleTime>
                </OtherInfos>
              </Article>
            ))}
          </Articles>
        </Main>
        <Aside>
          <AsideTitle>問答園地</AsideTitle>
          <AsideContent>
            給熱愛瑜伽、對瑜伽有興趣的同好們，有瑜伽相關的任何問題都非常歡迎大家發問唷～ 希望大家可以有個舒適的空間！
            <br />
            記得遵守板規規範， 祝大家在瑜伽的路上開開心心，體驗瑜伽帶來的美好～
          </AsideContent>
          <Button
            onClick={() => {
              if (!isLogin) {
                Swal.fire({ title: "登入後才能發問唷！", confirmButtonColor: "#5d7262", icon: "warning" });
                setShowMemberModal(true);
                return;
              }
              router.push("/forum/post");
            }}
          >
            我想問問題
          </Button>
        </Aside>
      </Container>
    </Wrapper>
  );
}

export default Forum;
