import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "../../../../../lib/firebase";

interface courseDataInteface {
  name: string;
  chapters: { id: number; title: string; units: { id: number; title: string; video: string }[] }[];
  introduction: string;
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
  font-size: 24px;
  color: blue;
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 1280px;
  height: 720px;
  margin-bottom: 20px;
`;
const SubTitle = styled.h3`
  font-size: 20px;
  color: green;
  margin-bottom: 20px;
`;
const Chapters = styled.ul``;
const Chapter = styled.li``;

const Introduction = styled.p`
  font-size: 18px;
`;

function VideoRoom() {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState<courseDataInteface | null>(null);

  useEffect(() => {
    const getCourse = async () => {
      if (typeof courseId !== "string") return;
      const docRef = doc(db, "video_courses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { name, chapters, introduction, teacher_id: teacherId } = docSnap.data();
        setCourseData({ name, chapters, introduction, teacherId });
      }
    };
    getCourse();
  }, [courseId]);
  return (
    <Wrapper>
      <Title>{courseData?.name}</Title>
      <Video autoPlay controls muted>
        {courseData && <source src={courseData.chapters[0].units[0].video} type="video/mp4" />}
      </Video>
      <SubTitle>課程章節</SubTitle>
      <Chapters>
        {courseData?.chapters.map((chapter) => (
          <Chapter key={chapter.id}>{chapter.title}</Chapter>
        ))}
      </Chapters>
      <Introduction>{courseData?.introduction}</Introduction>
    </Wrapper>
  );
}

export default VideoRoom;
