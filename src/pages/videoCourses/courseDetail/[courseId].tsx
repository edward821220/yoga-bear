import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/router";
import Image from "next/image";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { db } from "../../../../lib/firebase";
import { AuthContext } from "../../../contexts/authContext";
import { orderQtyState } from "../../../../lib/recoil";
import Star from "../../../../public/star.png";
import Avatar from "../../../../public/member.png";

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Title = styled.h2`
  font-size: 28px;
  color: blue;
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 1280px;
  height: 720px;
  margin-bottom: 20px;
`;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color3};
  border-radius: 5px;
  width: 120px;
  padding: 10px;
  margin-bottom: 20px;
  cursor: pointer;
`;
const SubTitle = styled.h3`
  font-size: 24px;
  color: green;
  margin-bottom: 20px;
`;
const Chapters = styled.ul`
  margin-bottom: 30px;
  border-bottom: 1px solid gray;
  width: 100%;
`;
const Chapter = styled.li``;
const ChapterTitle = styled.h4`
  color: #ff7b00;
  font-size: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
`;
const Units = styled.ul``;
const Unit = styled.li``;
const UnitTitle = styled.h5`
  color: #056962;
  font-size: 16px;
  margin-bottom: 10px;
`;
const Introduction = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
`;
const Reviews = styled.ul`
  width: 50%;
`;
const Review = styled.li`
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  width: 100%;
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
const Comments = styled.p``;

interface CourseDataInteface {
  id: string;
  name: string;
  chapters: { id: number; title: string; units: { id: number; title: string; video: string }[] }[];
  introduction: string;
  introductionVideo: string;
  teacherId: string;
  cover: string;
  price: string;
  reviews: { comments: string; score: number; userId: string }[];
}

function CourseDetail() {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState<CourseDataInteface>();
  const [reviewsUsersDatas, setReviewsUsersDatas] = useState<{ index: number; username: string; avatar: string }[]>([]);
  const [boughtCourses, setBoughtCourses] = useState<string[]>([]);
  const { isLogin, userData } = useContext(AuthContext);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);

  useEffect(() => {
    const getCourse = async () => {
      if (typeof courseId !== "string") return;
      const docRef = doc(db, "video_courses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const {
          id,
          name,
          chapters,
          introduction,
          introductionVideo,
          teacher_id: teacherId,
          cover,
          price,
          reviews,
        } = docSnap.data();
        setCourseData({ id, name, chapters, introduction, introductionVideo, teacherId, cover, price, reviews });

        if (!Array.isArray(reviews)) return;
        reviews.forEach(async (review: { comments: string; score: number; userId: string }, index) => {
          const userRef = doc(db, "users", review.userId);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) return;
          const { username } = userSnap.data();
          const avatar = userSnap.data().photoURL;
          setReviewsUsersDatas((prev) => [...prev, { index, username, avatar }]);
        });
      }
    };
    getCourse();
  }, [courseId]);

  useEffect(() => {
    const getBoughtCourses = async () => {
      if (!userData.uid) return;
      const userRef = doc(db, "users", userData.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const courses = docSnap.data().boughtCourses as string[];
        setBoughtCourses(courses);
      }
    };
    getBoughtCourses();
  }, [userData.uid]);

  const addToCart = async () => {
    if (!isLogin) {
      alert("請先登入唷！");
      return;
    }
    const userRef = doc(db, "users", userData.uid);
    if (!courseData) return;
    await updateDoc(userRef, {
      cartItems: arrayUnion({
        id: courseData.id,
        name: courseData.name,
        cover: courseData.cover,
        price: courseData.price,
      }),
    });
    alert("已加入購物車");
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const qty: number = docSnap.data()?.cartItems?.length;
      setOrderQty(qty);
    }
  };

  return (
    <Wrapper>
      <Title>{courseData?.name}-課程介紹影片</Title>
      <Video
        src={courseData?.introductionVideo}
        onEnded={() => {
          alert("喜歡老師的介紹嗎？想繼續上課請購買課程支持老師唷！");
        }}
        autoPlay
        controls
      />
      {typeof courseId === "string" && !boughtCourses?.includes(courseId) ? (
        <Button type="button" onClick={addToCart}>
          加入購物車
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => {
            if (typeof courseId !== "string") return;
            router.push(`/myCourses/classRoom/videoRoom/${courseId}`);
          }}
        >
          前往課程
        </Button>
      )}
      <SubTitle>課程章節</SubTitle>
      <Chapters>
        {courseData?.chapters.map((chapter, chapterIndex) => (
          <Chapter key={chapter.id}>
            <ChapterTitle>
              章節{chapterIndex + 1}：{chapter.title}
            </ChapterTitle>
            {chapter.units.map((unit, unitIndex) => (
              <Units key={unit.id}>
                <Unit>
                  <UnitTitle>
                    單元{unitIndex + 1}：{unit.title}
                  </UnitTitle>
                </Unit>
              </Units>
            ))}
          </Chapter>
        ))}
      </Chapters>
      <SubTitle>課程特色</SubTitle>
      <Introduction>{courseData?.introduction}</Introduction>
      <SubTitle>老師簡介</SubTitle>
      <Introduction />
      <SubTitle>課程評價</SubTitle>
      <Reviews>
        {courseData &&
          courseData?.reviews?.map((review, reviewIndex) => (
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

export default CourseDetail;
