import { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../../lib/firebase";
import ReserveCalendar from "../../../components/calendar/reserveCalendar";
import Avatar from "../../../../public/member.png";
import Star from "../../../../public/star.png";

const Wrapper = styled.div`
  background-color: #f1ead8;
  min-height: calc(100vh - 100px);
  padding: 20px;
  margin: 0 auto;
`;
const TeacherContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #654116;
  padding-bottom: 30px;
  margin-bottom: 30px;
`;

const TeacherDetail = styled.div`
  flex-basis: 50%;
`;
const TeacherInfo = styled.div`
  display: flex;
  margin-bottom: 20px;
`;
const TeacherAvatar = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  margin-right: 20px;
`;
const TeacherName = styled.p``;
const IntroductionTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
`;
const Introduction = styled.p``;
const CalendarWrapper = styled.div`
  flex-basis: 50%;
`;
const Reviews = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const ReviewQty = styled.p`
  margin-bottom: 20px;
`;
const Review = styled.li`
  width: 50%;
  border: 2px solid #654116;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
`;
const User = styled.div`
  display: flex;
  margin-bottom: 10px;
`;
const AvatarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;
const UserName = styled.p``;
const Score = styled.div`
  margin-bottom: 10px;
  display: flex;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;
const Class = styled.p`
  margin-bottom: 10px;
`;
const Comments = styled.p``;

interface ReviewInterface {
  class: string;
  score: number;
  comments: string;
  userId: string;
}
export default function Reserve() {
  const router = useRouter();
  const { teacherId } = router.query;
  const [teacherDatas, setTeacherDatas] = useState<{
    username: string;
    reviews?: ReviewInterface[];
    avatar?: string;
  }>();
  const [reviewsUsersDatas, setReviewsUsersDatas] = useState<{ index: number; username: string; avatar: string }[]>([]);

  useEffect(() => {
    const getTeacherData = async () => {
      if (typeof teacherId !== "string") return;
      const userRef = doc(db, "users", teacherId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const username = userSnap.data().username as string;
      const avatar = userSnap.data().photoURL as string;
      const reviews = userSnap.data().reviews as ReviewInterface[];
      setTeacherDatas({ username, reviews, avatar });

      if (!Array.isArray(reviews)) return;
      reviews.forEach(async (review: { comments: string; score: number; userId: string }, index) => {
        const reviewUserRef = doc(db, "users", review.userId);
        const reviewUserSnap = await getDoc(reviewUserRef);
        if (!reviewUserSnap.exists()) return;
        const reviewUsername = reviewUserSnap.data().username;
        const reviewUserAvatar = reviewUserSnap.data().photoURL;
        setReviewsUsersDatas((prev) => [...prev, { index, username: reviewUsername, avatar: reviewUserAvatar }]);
      });
    };
    getTeacherData();
  }, [teacherId]);

  return (
    <Wrapper>
      <TeacherContainer>
        <TeacherDetail>
          <TeacherInfo>
            <TeacherAvatar>
              <Image src={teacherDatas?.avatar || Avatar} alt="avatar" fill sizes="contain" />
            </TeacherAvatar>
            <TeacherName>{teacherDatas?.username}</TeacherName>
          </TeacherInfo>
          <IntroductionTitle>自我介紹</IntroductionTitle>
          <Introduction>Hi 各位同學大家好</Introduction>
        </TeacherDetail>
        <CalendarWrapper>{typeof teacherId === "string" && <ReserveCalendar teacherId={teacherId} />}</CalendarWrapper>
      </TeacherContainer>
      <Reviews>
        <ReviewQty>共 {teacherDatas?.reviews?.length} 筆給老師的評價</ReviewQty>
        {teacherDatas?.reviews?.map((review, reviewIndex) => (
          <Review key={review.userId}>
            <User>
              <AvatarWrapper>
                <Image
                  src={
                    reviewsUsersDatas.find((reviewUserData) => reviewUserData.index === reviewIndex)?.avatar || Avatar
                  }
                  alt="avatar"
                  fill
                  sizes="contain"
                />
              </AvatarWrapper>
              <UserName>
                {reviewsUsersDatas.find((reviewUserData) => reviewUserData.index === reviewIndex)?.username}
              </UserName>
            </User>
            <Class>課程：{review.class}</Class>
            <Score>
              {Array.from(
                {
                  length: review.score,
                },
                (v, i) => i + 1
              ).map((starIndex) => (
                <StarWrapper key={starIndex}>
                  <Image src={Star} alt="star" fill sizes="contain" />
                </StarWrapper>
              ))}
            </Score>
            <Comments>{review.comments}</Comments>
          </Review>
        ))}
      </Reviews>
    </Wrapper>
  );
}
