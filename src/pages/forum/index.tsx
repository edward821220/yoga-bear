import Image from "next/image";
import React, { useContext } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import parse from "html-react-parser";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import BannerPic from "../../../public/banner0.jpeg";
import LikeIcon from "../../../public/like.png";
import MessageIcon from "../../../public/message.png";
import Avatar from "../../../public/member.png";
import { AuthContext } from "../../contexts/authContext";
import { showMemberModalState } from "../../utils/recoil";
import { getAllArticles, getUserData } from "../../utils/firestore";

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
  max-width: 746px;
`;
const ArticleText = styled.div`
  flex-basis: 75%;
  margin-right: 10px;
  overflow: hidden;
`;
const PicPreview = styled.div`
  position: relative;
  flex-basis: 25%;
  height: 90px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: bolder;
  margin-bottom: 10px;
  width: 100%;
  overflow: hidden;
  word-wrap: break-word;
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

function Forum({ posts }: { posts: PostInterface[] }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
  const { isLogin } = useContext(AuthContext);

  return (
    <>
      <Head>
        <title>問答園地 - Yoga Bear</title>
      </Head>
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
                      <Image
                        src={article.authorAvatar || Avatar}
                        alt="avatar"
                        fill
                        sizes="contain"
                        style={{ objectFit: "cover" }}
                      />
                    </UserAvatarWrapper>
                    <UserName>{article.authorName}</UserName>
                  </ArticleUser>
                  <ArticleInfo>
                    <ArticleText>
                      <ArticleTitle>{article.title}</ArticleTitle>
                      {article.preview && <ArticlePreview>{parse(article?.preview)}</ArticlePreview>}
                    </ArticleText>
                    {article.picPreview && <PicPreview>{parse(article?.picPreview)}</PicPreview>}
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
    </>
  );
}

export default Forum;

export const getServerSideProps = async () => {
  const results = await getAllArticles();
  await Promise.all(
    results.map(async (result: PostInterface, index) => {
      const userSnap = await getUserData(result.authorId);
      if (userSnap.exists()) {
        const authorName = userSnap.data().username as string;
        const authorAvatar = userSnap.data().photoURL as string;
        results[index].authorName = authorName;
        results[index].authorAvatar = authorAvatar;
      }
    })
  );
  return {
    props: {
      posts: results,
    },
  };
};
