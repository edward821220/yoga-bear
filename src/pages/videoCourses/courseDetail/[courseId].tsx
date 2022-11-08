import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "../../../../lib/firebase";

interface CourseDataInteface {
  name: string;
  chapters: { id: number; title: string; units: { id: number; title: string; video: string }[] }[];
  introduction: string;
  introductionVideo: string;
  teacherId: string;
}

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
  background-color: transparent;
  margin-bottom: 20px;
  padding: 10px;

  cursor: pointer;
  &:hover {
    background-color: gray;
    color: white;
  }
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

function CourseDetail() {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState<CourseDataInteface>();

  useEffect(() => {
    const getCourse = async () => {
      if (typeof courseId !== "string") return;
      const docRef = doc(db, "video_courses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { name, chapters, introduction, introductionVideo, teacher_id: teacherId } = docSnap.data();
        setCourseData({ name, chapters, introduction, introductionVideo, teacherId });
      }
    };
    getCourse();
  }, [courseId]);

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
      <Button>加入購物車</Button>
      <SubTitle>課程簡介-章節</SubTitle>
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
      <SubTitle>課程簡介-特色</SubTitle>
      <Introduction>{courseData?.introduction}</Introduction>
      <SubTitle>課程簡介-老師</SubTitle>
      <Introduction />
    </Wrapper>
  );
}

export default CourseDetail;