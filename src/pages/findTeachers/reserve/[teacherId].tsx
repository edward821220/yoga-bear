import { useState, useEffect } from "react";
import styled from "styled-components";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";
import { getUserData, getLaunchedVideoCourses } from "../../../utils/firestore";
import Calendar from "../../../components/calendar/calendar";
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
  margin-bottom: 10px;
  @media screen and (max-width: 1280px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const TeacherDetail = styled.div`
  flex-basis: 40%;
  margin-right: 20px;
  @media screen and (max-width: 1280px) {
    flex-basis: 70%;
    margin-right: 0;
  }
`;
const TeacherInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;
const TeacherAvatar = styled.div`
  position: relative;
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
  margin-top: 132px;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
  height: 602px;
  @media screen and (max-width: 1280px) {
    max-width: 98%;
    margin-top: 10px;
  }
`;
const CoursesList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-column-gap: calc((1024px - 900px) / 2);
  grid-row-gap: 20px;
  width: 80%;
  @media screen and (max-width: 1280px) {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 0 auto;
  }
  @media screen and (max-width: 888px) {
    justify-content: center;
  }
`;
const Course = styled.li`
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  border: 1px solid lightgrey;
  box-shadow: 0 0 5px #00000050;
  border-radius: 5px;
  @media screen and (max-width: 1280px) {
    flex-basis: 45%;
  }
  @media screen and (max-width: 888px) {
    flex-basis: 80%;
  }
`;
const CourseCover = styled.div`
  position: relative;
  width: 300px;
  height: 180px;
  margin-bottom: 10px;
  @media screen and (max-width: 1280px) {
    width: 100%;
    height: 210px;
  }
  @media screen and (max-width: 888px) {
    height: 240px;
  }
  @media screen and (max-width: 540px) {
    height: 200px;
  }
  @media screen and (max-width: 450px) {
    height: 150px;
  }
`;
const CourseInfos = styled.div`
  position: relative;
  width: 100%;
  margin-left: 10px;
`;
const CourseTitle = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;
const CourseScore = styled.div`
  display: flex;
`;
const CourseReviewsInfo = styled.p`
  height: 26px;
  margin-bottom: 10px;
`;

const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
`;
const CourseStarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;
const CoursesWrapper = styled.div`
  max-width: 1280px;
  margin: 20px auto;
`;
const CourseContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const Reviews = styled.ul`
  border-top: 2px solid #654116;
  margin-top: 50px;
  padding-top: 50px;
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
  @media screen and (max-width: 1280px) {
    min-width: 770px;
  }
  @media screen and (max-width: 780px) {
    min-width: 0;
    width: 95%;
  }
`;
const User = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 80px;
`;
const AvatarWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  @media screen and (max-width: 780px) {
    width: 46px;
    height: 46px;
  }
`;
const UserName = styled.p`
  text-align: center;
`;
const CommentWrapper = styled.div`
  max-width: 80%;
`;
const Score = styled.div`
  margin-bottom: 10px;
  display: flex;
  margin-bottom: 20px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  @media screen and (max-width: 780px) {
    width: 20px;
    height: 20px;
  }
`;
const Comments = styled.p`
  font-size: 18px;
  word-wrap: break-word;
  @media screen and (max-width: 780px) {
    font-size: 16px;
  }
`;

const Class = styled.p`
  margin-bottom: 10px;
`;

interface CourseInterface {
  name: string;
  id: string;
  cover: string;
  reviews: { userId: string; score: number; comments: string }[];
}

function LaunchedVideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<CourseInterface[]>();

  useEffect(() => {
    const getLaunchedCourses = async () => {
      const launchedVideoCourses = await getLaunchedVideoCourses(uid);

      setCourses(launchedVideoCourses);
    };
    getLaunchedCourses();
  }, [uid]);

  if (courses?.length === 0) {
    return <p>目前沒有課程唷！</p>;
  }
  return (
    <CoursesList>
      {courses?.map((course) => (
        <Course key={course.name}>
          <CourseCover>
            <Link href={`/videoCourses/courseDetail/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="cover" />
            </Link>
          </CourseCover>
          <CourseInfos>
            <CourseTitle>{course.name}</CourseTitle>
            {course?.reviews?.length > 0 ? (
              <CourseScore>
                <StarIcons>
                  {Array.from(
                    {
                      length: Math.floor(
                        course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length
                      ),
                    },
                    (v, i) => i + 1
                  ).map((starIndex) => (
                    <CourseStarWrapper key={starIndex}>
                      <Image src={Star} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  ))}
                  {(course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length) % 1 !== 0 && (
                    <CourseStarWrapper>
                      <Image src={HalfStar} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  )}
                </StarIcons>
                <CourseReviewsInfo>
                  {(course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length || 0).toFixed(1) ||
                    0}
                  分 ，{course?.reviews?.length || 0}則評論
                </CourseReviewsInfo>
              </CourseScore>
            ) : (
              <CourseReviewsInfo>目前無評價</CourseReviewsInfo>
            )}
          </CourseInfos>
        </Course>
      ))}
    </CoursesList>
  );
}

interface ReviewInterface {
  class: string;
  score: number;
  comments: string;
  userId: string;
}
interface TeacherDataInterface {
  username: string;
  introduction: string;
  experience: string;
  reviews?: ReviewInterface[];
  avatar?: string;
}
export default function Reserve({ teacherId, teacherData }: { teacherId: string; teacherData: TeacherDataInterface }) {
  const [reviewUsersData, setReviewUsersData] = useState<{ index: number; username: string; avatar: string }[]>([]);

  useEffect(() => {
    if (!Array.isArray(teacherData.reviews)) return;
    teacherData.reviews.forEach(async (review: { comments: string; score: number; userId: string }, index) => {
      const reviewUserSnap = await getUserData(review.userId);
      if (!reviewUserSnap.exists()) return;
      const reviewUsername = reviewUserSnap.data().username as string;
      const reviewUserAvatar = reviewUserSnap.data().photoURL as string;
      setReviewUsersData((prev) => [...prev, { index, username: reviewUsername, avatar: reviewUserAvatar }]);
    });
  }, [teacherData.reviews]);

  return (
    <>
      <Head>
        <title>{teacherData?.username} 老師 - Yoga Bear</title>
      </Head>
      <Wrapper>
        <TeacherContainer>
          <TeacherDetail>
            <TeacherInfo>
              <TeacherAvatar>
                <Image
                  src={teacherData?.avatar || Avatar}
                  alt="avatar"
                  fill
                  sizes="contain"
                  style={{ objectFit: "cover" }}
                />
              </TeacherAvatar>
              <TeacherName>{teacherData?.username} 老師</TeacherName>
            </TeacherInfo>
            <Introduction>
              <IntroductionTitle>自我介紹</IntroductionTitle>
              {teacherData && (
                <IntroductionContents className="ql-editor">{parse(teacherData.introduction)}</IntroductionContents>
              )}
              <IntroductionTitle>老師經歷</IntroductionTitle>
              {teacherData && (
                <IntroductionContents className="ql-editor">{parse(teacherData.experience)}</IntroductionContents>
              )}
            </Introduction>
          </TeacherDetail>
          <CalendarWrapper>
            {typeof teacherId === "string" && <Calendar category="reserveCalendar" teacherId={teacherId} />}
          </CalendarWrapper>
        </TeacherContainer>
        {typeof teacherId === "string" && (
          <>
            <IntroductionTitle style={{ paddingLeft: "10px", marginBottom: "42px" }}>老師的影音課程</IntroductionTitle>
            <CoursesWrapper>
              <CourseContainer>
                <LaunchedVideoCourses uid={teacherId} />
              </CourseContainer>
            </CoursesWrapper>
          </>
        )}
        {teacherData?.reviews && (
          <Reviews>
            <ScoreContainer>
              <Average>
                {(
                  teacherData.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherData.reviews.length || 0
                ).toFixed(1) || 0}
              </Average>
              <ReviewsInfo>
                <StarIcons>
                  {Array.from(
                    {
                      length: Math.floor(
                        teacherData.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherData.reviews.length
                      ),
                    },
                    (v, i) => i + 1
                  ).map((starIndex) => (
                    <StarWrapper key={starIndex}>
                      <Image src={Star} alt="star" fill sizes="contain" />
                    </StarWrapper>
                  ))}
                  {(teacherData.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacherData.reviews.length) % 1 !==
                    0 && (
                    <StarWrapper>
                      <Image src={HalfStar} alt="star" fill sizes="contain" />
                    </StarWrapper>
                  )}
                </StarIcons>
                <ReviewQty>{teacherData.reviews.length} 則評價</ReviewQty>
              </ReviewsInfo>
            </ScoreContainer>
            {teacherData &&
              teacherData?.reviews?.map((review, reviewIndex) => (
                <Review key={review.userId}>
                  <User>
                    <AvatarWrapper>
                      <Image
                        src={
                          reviewUsersData.find((reviewUserInfo) => reviewUserInfo.index === reviewIndex)?.avatar ||
                          Avatar
                        }
                        alt="avatar"
                        fill
                        sizes="contain"
                        style={{ objectFit: "cover" }}
                      />
                    </AvatarWrapper>
                    <UserName>
                      {reviewUsersData.find((reviewUserInfo) => reviewUserInfo.index === reviewIndex)?.username}
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
        )}
      </Wrapper>
    </>
  );
}

export async function getServerSideProps({ params }: { params: { teacherId: string } }) {
  const userSnap = await getUserData(params.teacherId);
  if (!userSnap.exists()) {
    return {
      notFound: true,
    };
  }
  const username = userSnap.data().username as string;
  const introduction = userSnap.data().teacher_introduction as string;
  const experience = userSnap.data().teacher_experience as string;
  const avatar = userSnap.data().photoURL as string;
  const reviews = (userSnap.data().reviews as ReviewInterface[]) || null;
  const teacherData = { username, introduction, experience, reviews, avatar };

  return { props: { teacherId: params.teacherId, teacherData } };
}
