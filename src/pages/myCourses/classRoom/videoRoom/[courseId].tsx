import React, { useState, useEffect } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "../../../../../lib/firebase";
import Play from "../../../../../public/play.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background-color: #f1ead8;
  min-height: calc(100vh - 100px);
`;

const CourseContainer = styled.div<{ backgroundImage: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 610px;
  background-image: ${(props) => `url(${props.backgroundImage})`};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 50px;
  &::before {
    content: "";
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    height: 610px;
    background-color: #f1ead888;
  }
`;
const Title = styled.h2`
  font-size: 40px;
  font-weight: bold;
  color: #654116;
  margin: 30px 0;
  z-index: 8;
`;
const VideoContainer = styled.div`
  display: flex;
  z-index: 8;
`;
const Video = styled.video`
  width: 754px;
  height: 417px;
  margin-bottom: 20px;
`;
const ChapterSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 406px;
  height: 417px;
  color: #654116;
  background-color: #f1ead8;
  border: 2px solid #654116;
  border-radius: 5px;
  padding-top: 20px;
  overflow-y: scroll;
`;
const SubTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
`;
const Chapters = styled.ul`
  margin-bottom: 30px;
  width: 100%;
`;
const Chapter = styled.li``;
const ChapterTitle = styled.h4`
  font-size: 20px;
  line-height: 26px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 20px;
  margin-top: 20px;
`;
const Units = styled.ul``;
const Unit = styled.li<{ focus: boolean }>`
  color: ${(props) => props.focus && "#fff"};
  background-color: ${(props) => props.focus && "#5d7262"};
  padding: 20px 0;
  padding-left: 20px;
  cursor: pointer;
`;
const UnitTitle = styled.h5`
  display: flex;
  align-items: center;
  font-size: 18px;
  line-height: 20px;
`;
const PlayIcon = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;
const CourseDetail = styled.div``;
const Introduction = styled.p`
  font-size: 18px;
`;

interface CourseDataInteface {
  name: string;
  cover: string;
  chapters: { id: number; title: string; units: { id: number; title: string; video: string }[] }[];
  introduction: string;
  teacherId: string;
}

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
        const { name, cover, chapters, introduction, teacher_id: teacherId } = docSnap.data();
        setCourseData({ name, cover, chapters, introduction, teacherId });
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
    } else if (courseData.chapters[selectChapter + 1]?.units[0].video) {
      setSelectUnit(0);
      setSelectChpter((prev) => prev + 1);
    } else {
      alert("恭喜您完課!");
    }
  };

  return (
    <Wrapper>
      <CourseContainer backgroundImage={courseData?.cover || ""}>
        <Title>{courseData?.name}</Title>
        <VideoContainer>
          <Video
            src={courseData?.chapters[selectChapter].units[selectUnit].video}
            onEnded={handleSwitch}
            autoPlay
            controls
            controlsList="nodownload"
          />
          <ChapterSelector>
            <SubTitle>課程章節</SubTitle>
            <Chapters>
              {courseData?.chapters.map((chapter, chapterIndex) => (
                <Chapter key={chapter.id}>
                  <ChapterTitle>
                    章節{chapterIndex + 1}：{chapter.title}
                  </ChapterTitle>
                  {chapter.units.map((unit, unitIndex) => (
                    <Units key={unit.id}>
                      <Unit
                        onClick={() => {
                          handleSelect(chapterIndex, unitIndex);
                        }}
                        focus={selectChapter === chapterIndex && selectUnit === unitIndex}
                      >
                        <UnitTitle>
                          {selectChapter === chapterIndex && selectUnit === unitIndex && (
                            <PlayIcon>
                              <Image src={Play} alt="play" fill sizes="contain" />
                            </PlayIcon>
                          )}
                          單元{unitIndex + 1}：{unit.title}
                        </UnitTitle>
                      </Unit>
                    </Units>
                  ))}
                </Chapter>
              ))}
            </Chapters>
          </ChapterSelector>
        </VideoContainer>
      </CourseContainer>
      <CourseDetail>
        <Introduction>{courseData?.introduction}</Introduction>
      </CourseDetail>
    </Wrapper>
  );
}

export default VideoRoom;
