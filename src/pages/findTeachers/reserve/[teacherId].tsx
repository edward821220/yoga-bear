import { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../../lib/firebase";
import ReserveCalendar from "../../../components/calendar/reserveCalendar";
import Avatar from "../../../../public/member.png";
import Star from "../../../../public/star.png";
import HalfStar from "../../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
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
  flex-basis: 40%;
  margin-right: 20px;
`;
const TeacherInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;
const TeacherAvatar = styled.div`
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
`;
const TeacherName = styled.p`
  font-size: 22px;
  color: ${(props) => props.theme.colors.color2};
`;
const Introduction = styled.div`
  padding: 0 10px;
`;
const IntroductionTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.color2};
`;
const IntroductionContents = styled.div`
  color: ${(props) => props.theme.colors.color7};
  margin-bottom: 20px;
  p {
    line-height: 28px;
  }
`;
const CalendarWrapper = styled.div`
  flex-basis: 60%;
  margin-top: 86px;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
`;
const Reviews = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ScoreContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  width: 60%;
`;
const Average = styled.h5`
  font-size: 66px;
  font-weight: bold;
  margin-right: 30px;
`;
const ReviewsInfo = styled.div`
  padding: 10px;
`;
const StarIcons = styled.div`
  display: flex;
  margin-bottom: 10px;
`;
const ReviewQty = styled.p`
  font-size: 20px;
`;
const Review = styled.li`
  display: flex;
  background-color: #f4f7f7;
  border-radius: 5px;
  width: 60%;
  height: 150px;
  padding: 24px;
  margin-bottom: 20px;
`;
const User = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 80px;
`;
const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
`;
const UserName = styled.p`
  text-align: center;
`;
const CommentWrapper = styled.div``;
const Score = styled.div`
  margin-bottom: 10px;
  display: flex;
  margin-bottom: 20px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;
const Comments = styled.p`
  font-size: 18px;
`;

const Class = styled.p`
  margin-bottom: 10px;
`;

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
    introduction: string;
    exprience: string;
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
      const introduction = userSnap.data().teacher_introduction as string;
      const exprience = userSnap.data().teacher_exprience as string;
      const avatar = userSnap.data().photoURL as string;
      const reviews = userSnap.data().reviews as ReviewInterface[];
      setTeacherDatas({ username, introduction, exprience, reviews, avatar });

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
              <Image src={teacherDatas?.avatar || Avatar} alt="avatar" width={120} height={120} />
            </TeacherAvatar>
            <TeacherName>{teacherDatas?.username} 老師</TeacherName>
          </TeacherInfo>
          <Introduction>
            <IntroductionTitle>自我介紹</IntroductionTitle>
            {teacherDatas && (
              <IntroductionContents
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: teacherDatas.introduction }}
              />
            )}
            <IntroductionTitle>老師經歷</IntroductionTitle>
            {teacherDatas && (
              <IntroductionContents
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: teacherDatas.exprience }}
              />
            )}
          </Introduction>
        </TeacherDetail>
        <CalendarWrapper>{typeof teacherId === "string" && <ReserveCalendar teacherId={teacherId} />}</CalendarWrapper>
      </TeacherContainer>
      <Reviews>
        {teacherDatas?.reviews && (
          <ScoreContainer>
            <Average>
              {(
                teacherDatas.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherDatas.reviews.length || 0
              ).toFixed(1) || 0}
            </Average>
            <ReviewsInfo>
              <StarIcons>
                {Array.from(
                  {
                    length: Math.floor(
                      teacherDatas.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherDatas.reviews.length
                    ),
                  },
                  (v, i) => i + 1
                ).map((starIndex) => (
                  <StarWrapper key={starIndex}>
                    <Image src={Star} alt="star" fill sizes="contain" />
                  </StarWrapper>
                ))}
                {(teacherDatas.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherDatas.reviews.length) % 1 !==
                  0 && (
                  <StarWrapper>
                    <Image src={HalfStar} alt="star" fill sizes="contain" />
                  </StarWrapper>
                )}
              </StarIcons>
              <ReviewQty>{teacherDatas.reviews.length} 則評價</ReviewQty>
            </ReviewsInfo>
          </ScoreContainer>
        )}
        {teacherDatas &&
          teacherDatas?.reviews?.map((review, reviewIndex) => (
            <Review key={review.userId}>
              <User>
                <AvatarWrapper>
                  <Image
                    src={
                      reviewsUsersDatas.find((reviewUserData) => reviewUserData.index === reviewIndex)?.avatar || Avatar
                    }
                    alt="avatar"
                    width={120}
                    height={120}
                  />
                </AvatarWrapper>
                <UserName>
                  {reviewsUsersDatas.find((reviewUserData) => reviewUserData.index === reviewIndex)?.username}
                </UserName>
              </User>
              <CommentWrapper>
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
                <Class>課程：{review.class}</Class>
                <Comments>{review.comments}</Comments>
              </CommentWrapper>
            </Review>
          ))}
      </Reviews>
    </Wrapper>
  );
}
