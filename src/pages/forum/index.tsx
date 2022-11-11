import Image from "next/image";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { type } from "os";
import BannerPic from "../../../public/yoga-banner.jpg";
import LikeIcon from "../../../public/like.png";
import MessageIcon from "../../../public/message.png";
import Avatar from "../../../public/member.png";
import { db } from "../../../lib/firebase";

const Wrapper = styled.div`
  max-width: 1096px;
  margin: 0 auto;
  display: flex;
  padding: 0 10px 20px 10px;
`;
const Main = styled.main`
  flex-basis: 70%;
  margin-right: 10px;
`;
const BannerWrapper = styled.div`
  position: relative;
  height: 350px;
  margin-bottom: 20px;
`;
const Aside = styled.div`
  flex-basis: 30%;
  height: 300px;
  border: 1px solid gray;
  padding: 10px;
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
  background-color: transparent;
  padding: 10px;
  margin: 0 auto;
  cursor: pointer;
`;
const Articles = styled.ul``;

const Article = styled.li`
  border-bottom: 1px solid gray;
  padding-bottom: 20px;
  margin-bottom: 20px;
  cursor: pointer;
`;
const ArticleUser = styled.div`
  display: flex;
  margin-bottom: 15px;
`;
const UserAvatarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 5px;
`;
const UserName = styled.span``;

const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: bolder;
  margin-bottom: 10px;
`;
const ArticlePreview = styled.div`
  margin-bottom: 20px;
`;
const ArticleActivity = styled.div`
  display: flex;
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
  title: string;
  content: string;
  preview?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
}

function Forum() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostInterface[]>([]);

  useEffect(() => {
    const getPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const results: PostInterface[] = querySnapshot.docs.map((data) => {
        const datas = data.data() as PostInterface;
        const paragraphs = datas?.content?.match(/<p>.*?<\/p>/g);
        if (!paragraphs)
          return {
            id: data.data().id,
            title: data.data().title,
            content: data.data().content,
            authorId: data.data().author,
          };
        const preview: string = paragraphs[0].slice(3, -4);
        return {
          id: data.data().id,
          title: data.data().title,
          content: data.data().content,
          authorId: data.data().author,
          preview,
        };
      });
      await Promise.all(
        results.map(async (result: PostInterface, index) => {
          const docRef = doc(db, "users", result.authorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            results[index].authorName = docSnap.data().username;
            // results[index].authorAvatar = docSnap.data().avatar;
          }
        })
      );
      setPosts(results);
    };
    getPosts();
  }, []);
  return (
    <Wrapper>
      <Main>
        <BannerWrapper>
          <Image src={BannerPic} alt="banner" fill sizes="contain" />
        </BannerWrapper>
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
                  <Image src={Avatar} alt="avatar" fill sizes="contain" />
                </UserAvatarWrapper>
                <UserName>{article.authorName}</UserName>
              </ArticleUser>
              <ArticleTitle>{article.title}</ArticleTitle>
              {article.preview && <ArticlePreview dangerouslySetInnerHTML={{ __html: article?.preview }} />}
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
            router.push("/forum/post");
          }}
        >
          我想問問題
        </Button>
      </Aside>
    </Wrapper>
  );
}

export default Forum;
