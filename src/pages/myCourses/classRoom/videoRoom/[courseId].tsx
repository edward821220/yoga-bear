import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "../../../../../lib/firebase";
import Play from "../../../../../public/play.png";
import Pause from "../../../../../public/pause.png";
import Forward from "../../../../../public/forward.png";
import Rewind from "../../../../../public/rewind.png";
import Voice from "../../../../../public/voice.png";
import Speed from "../../../../../public/speed.png";
import Full from "../../../../../public/full-screen.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background-color: ${(props) => props.theme.colors.color1};
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
    z-index: -8;
  }
`;
const Title = styled.h2`
  font-size: 40px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.color2};
  margin: 30px 0;
`;
const CourseRoom = styled.div`
  display: flex;
`;
const VideoContainer = styled.div`
  position: relative;
  width: 754px;
  height: 417px;
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
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  padding-top: 20px;
  overflow-y: auto;
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
  color: ${(props) => props.focus && props.theme.colors.color3};
  background-color: ${(props) => props.focus && props.theme.colors.color4};
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
const ToolBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  bottom: 0;
  width: 754px;
  height: 66px;
  background-color: #00000050;
  padding: 10px 20px;
`;
const TimeControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-basis: 100%;
  margin-bottom: 10px;
`;
const TimeProgressBarContainer = styled.div`
  background-color: gray;
  border-radius: 15px;
  width: 550px;
  height: 5px;
  z-index: 30;
  position: relative;
  margin: 0 20px;
`;
const TimeProgressBar = styled.div`
  border-radius: 15px;
  background-color: ${(props) => props.theme.colors.color4};
  height: 100%;
`;
const ControlTime = styled.p`
  color: ${(props) => props.theme.colors.color3};
`;
const ControlButtons = styled.ul`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const PlayControls = styled.li`
  display: flex;
`;
const OtherControls = styled.li`
  display: flex;
`;
const ControlIcon = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    const time = setInterval(() => {
      if (!videoRef.current) return;
      setCurrentTime(videoRef.current?.currentTime);
      setProgress((videoRef.current.currentTime / videoTime) * 100);
    }, 500);
    return () => clearInterval(time);
  }, [videoTime]);

  const videoHandler = (control: string) => {
    if (!videoRef.current) return;
    switch (control) {
      case "play": {
        videoRef.current.play();
        setPlaying(true);
        setVideoTime(videoRef.current.duration);
        break;
      }
      case "pause": {
        videoRef.current.pause();
        setPlaying(false);
        break;
      }
      case "forward": {
        videoRef.current.currentTime += 5;
        break;
      }
      case "rewind": {
        videoRef.current.currentTime -= 5;
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleSelect = (chapterIndex: number, unitIndex: number) => {
    setSelectChpter(chapterIndex);
    setSelectUnit(unitIndex);
  };
  const handleSwitch = () => {
    setPlaying(false);
    if (!courseData) return;
    if (courseData.chapters[selectChapter].units[selectUnit + 1]?.video) {
      setSelectUnit((prev) => prev + 1);
      videoHandler("play");
    } else if (courseData.chapters[selectChapter + 1]?.units[0].video) {
      setSelectUnit(0);
      setSelectChpter((prev) => prev + 1);
      videoHandler("play");
    } else {
      alert("恭喜您完課!");
    }
  };

  return (
    <Wrapper>
      <CourseContainer backgroundImage={courseData?.cover || ""}>
        <Title>{courseData?.name}</Title>
        <CourseRoom>
          {/* <Video
            src={courseData?.chapters[selectChapter].units[selectUnit].video}
          /> */}
          <VideoContainer>
            <Video
              src="http://syddev.com/jquery.videoBG/assets/tunnel_animation.mp4"
              onEnded={handleSwitch}
              onClick={() => {
                if (playing) {
                  videoHandler("pause");
                } else {
                  videoHandler("play");
                }
              }}
              ref={videoRef}
            />
            <ToolBar>
              <TimeControls>
                <ControlTime>
                  {`${Math.floor(currentTime / 60)}:${`0${Math.floor(currentTime % 60)}`.slice(-2)}`}
                </ControlTime>
                <TimeProgressBarContainer>
                  <TimeProgressBar style={{ width: `${progress}%` }} />
                </TimeProgressBarContainer>
                <ControlTime>{`${Math.floor(videoTime / 60)}:${`0${Math.floor(videoTime % 60)}`.slice(
                  -2
                )}`}</ControlTime>
              </TimeControls>
              <ControlButtons>
                <PlayControls>
                  <ControlIcon
                    onClick={() => {
                      videoHandler("rewind");
                    }}
                  >
                    <Image src={Rewind} alt="rewind" fill sizes="contain" />
                  </ControlIcon>
                  {playing === false ? (
                    <ControlIcon
                      onClick={() => {
                        videoHandler("play");
                      }}
                    >
                      <Image src={Play} alt="play" fill sizes="contain" />
                    </ControlIcon>
                  ) : (
                    <ControlIcon
                      onClick={() => {
                        videoHandler("pause");
                      }}
                    >
                      <Image src={Pause} alt="pause" fill sizes="contain" />
                    </ControlIcon>
                  )}
                  <ControlIcon
                    onClick={() => {
                      videoHandler("forward");
                    }}
                  >
                    <Image src={Forward} alt="forward" fill sizes="contain" />
                  </ControlIcon>
                </PlayControls>
                <OtherControls>
                  <ControlIcon
                    onClick={() => {
                      // videoHandler("pause");
                    }}
                  >
                    <Image src={Voice} alt="voice" fill sizes="contain" />
                  </ControlIcon>
                  <ControlIcon
                    onClick={() => {
                      // videoHandler("pause");
                    }}
                  >
                    <Image src={Speed} alt="speed" fill sizes="contain" />
                  </ControlIcon>
                  <ControlIcon
                    onClick={() => {
                      // videoHandler("pause");
                    }}
                  >
                    <Image src={Full} alt="full" fill sizes="contain" />
                  </ControlIcon>
                </OtherControls>
              </ControlButtons>
            </ToolBar>
          </VideoContainer>
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
        </CourseRoom>
      </CourseContainer>
      <CourseDetail>
        <Introduction>{courseData?.introduction}</Introduction>
      </CourseDetail>
    </Wrapper>
  );
}

export default VideoRoom;
