import Image from "next/image";
import React from "react";
import styled from "styled-components";
import BannerPic from "../../public/yoga-banner.jpg";
import LikeIcon from "../../public/like.png";
import MessageIcon from "../../public/message.png";
import Avatar from "../../public/member.png";

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
`;
const Articles = styled.ul``;

const Article = styled.li`
  border-bottom: 1px solid gray;
  padding-bottom: 20px;
  margin-bottom: 20px;
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
const ArticlePreview = styled.p`
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

function Forum() {
  return (
    <Wrapper>
      <Main>
        <BannerWrapper>
          <Image src={BannerPic} alt="banner" fill />
        </BannerWrapper>
        <Articles>
          <Article>
            <ArticleUser>
              <UserAvatarWrapper>
                <Image src={Avatar} alt="avatar" fill />
              </UserAvatarWrapper>
              <UserName>Tom</UserName>
            </ArticleUser>
            <ArticleTitle>文章標題</ArticleTitle>
            <ArticlePreview>文章內容預覽......</ArticlePreview>
            <ArticleActivity>
              <IconWrapper>
                <Image src={LikeIcon} alt="like" fill />
              </IconWrapper>
              <ActivityQty>0</ActivityQty>
              <IconWrapper>
                <Image src={MessageIcon} alt="like" fill />
              </IconWrapper>
              <ActivityQty>0</ActivityQty>
            </ArticleActivity>
          </Article>
          <Article>
            <ArticleUser>
              <UserAvatarWrapper>
                <Image src={Avatar} alt="avatar" fill />
              </UserAvatarWrapper>
              <UserName>Tom</UserName>
            </ArticleUser>
            <ArticleTitle>文章標題</ArticleTitle>
            <ArticlePreview>文章內容預覽......</ArticlePreview>
            <ArticleActivity>
              <IconWrapper>
                <Image src={LikeIcon} alt="like" fill />
              </IconWrapper>
              <ActivityQty>0</ActivityQty>
              <IconWrapper>
                <Image src={MessageIcon} alt="like" fill />
              </IconWrapper>
              <ActivityQty>0</ActivityQty>
            </ArticleActivity>
          </Article>
        </Articles>
      </Main>
      <Aside>
        <AsideTitle>討論園地</AsideTitle>
        <AsideContent>
          給熱愛瑜伽、對瑜伽有興趣的同好們，不論瑜伽上的問題或是對瑜伽的想法，都非常歡迎大家發文哦～
          希望大家可以有個舒適的空間！
          <br />
          記得遵守板規規範， 祝大家在瑜伽的路上開開心心，體驗瑜伽帶來的美好～
        </AsideContent>
        <Button>發表文章</Button>
      </Aside>
    </Wrapper>
  );
}

export default Forum;
