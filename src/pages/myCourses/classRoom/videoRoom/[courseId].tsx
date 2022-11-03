import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "../../../../../lib/firebase";

interface CourseDataInteface {
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
  font-size: 28px;
  color: blue;
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 1280px;
  height: 720px;
  margin-bottom: 20px;
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
const Unit = styled.li`
  cursor: pointer;
`;
const UnitTitle = styled.h5`
  color: #056962;
  font-size: 16px;
  margin-bottom: 10px;
`;
const Introduction = styled.p`
  font-size: 18px;
`;

function VideoRoom() {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState<CourseDataInteface>();
  const [selectChapter, setSelectChpter] = useState(0);
  const [selectUnit, setSelectUnit] = useState(0);
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

  const handleSelect = (chapterIndex: number, unitIndex: number) => {
    setSelectChpter(chapterIndex);
    setSelectUnit(unitIndex);
  };
  const handleSwitch = () => {
    if (!courseData) return;
    if (courseData.chapters[selectChapter].units[selectUnit + 1]?.video) {
      setSelectUnit((prev) => prev + 1);
    } else if (courseData.chapters[selectChapter + 1]?.units[selectUnit].video) {
      setSelectChpter((prev) => prev + 1);
    } else {
      alert("恭喜您完課!");
    }
  };

  return (
    <Wrapper>
      <Title>{courseData?.name}</Title>
      <Video
        src={courseData?.chapters[selectChapter].units[selectUnit].video}
        onEnded={handleSwitch}
        autoPlay
        controls
      />
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
                  <UnitTitle
                    onClick={() => {
                      handleSelect(chapterIndex, unitIndex);
                    }}
                  >
                    單元{unitIndex + 1}：{unit.title}
                  </UnitTitle>
                </Unit>
              </Units>
            ))}
          </Chapter>
        ))}
      </Chapters>
      <Introduction>{courseData?.introduction}</Introduction>
    </Wrapper>
  );
}

export default VideoRoom;
