import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { db } from "../../../../../lib/firebase";
import Play from "../../../../../public/play.png";
import Pause from "../../../../../public/pause.png";
import Forward from "../../../../../public/forward.png";
import Rewind from "../../../../../public/rewind.png";
import Voice from "../../../../../public/voice.png";
import Mute from "../../../../../public/mute.png";
import Speed from "../../../../../public/speed.png";
import FullScreenIcon from "../../../../../public/full-screen.png";
import FullWindow from "../../../../../public/full-window.png";

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
  }
`;
const Title = styled.h2`
  font-size: 40px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.color2};
  margin: 30px 0;
  z-index: 8;
`;
const CourseRoom = styled.div`
  display: flex;
`;
const VideoContainer = styled.div<{ isFullScreen: boolean; isFullWindow: boolean }>`
  position: ${(props) => (props.isFullWindow ? "fixed" : "relative")};
  top: ${(props) => props.isFullWindow && "0"};
  left: ${(props) => props.isFullWindow && "0"};
  z-index: ${(props) => props.isFullWindow && "88"};
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  background-color: transparent;
`;

const Video = styled.video<{ isFullScreen: boolean; showToolBar: boolean; isFullWindow: boolean }>`
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  margin-bottom: 20px;
  cursor: ${(props) => props.showToolBar === false && "none"};
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
  z-index: 8;
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
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 740px;
  height: 60px;
  background-color: #00000050;
  padding: 10px 20px;
`;
const PlayControls = styled.div`
  display: flex;
`;
const TimeControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;
const TimeProgressBarContainer = styled.div`
  background-color: #484848;
  border-radius: 15px;
  width: 360px;
  height: 10px;
  z-index: 30;
  position: relative;
  margin: 0 20px;
  cursor: pointer;
`;
const TimeProgressBar = styled.div`
  border-radius: 15px;
  background-color: ${(props) => props.theme.colors.color4};
  height: 100%;
  filter: brightness(110%);
`;
const ControlTime = styled.p`
  color: ${(props) => props.theme.colors.color3};
`;
const VoiceBarContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 1px;
  display: flex;
  flex-direction: column-reverse;
  width: 24px;
  height: 120px;
  background-color: #484848;
`;
const VoiceBar = styled.div<{ height: number }>`
  background-color: ${(props) => props.theme.colors.color4};
  width: 100%;
  height: ${(props) => props.height}%;
  filter: brightness(110%);
`;
const SpeedMenu = styled.ul`
  position: absolute;
  bottom: 20px;
  transform: translateX(-24px);
  display: flex;
  flex-direction: column;
  width: 88px;
  background-color: #484848;
`;
const SpeedOption = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.color3};
  font-size: 18px;
  line-height: 24px;
  height: 36px;
  padding: 5px;
  text-align: center;
  &:hover {
    background-color: ${(props) => props.theme.colors.color4};
  }
`;
const OtherControls = styled.div`
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
  const handle = useFullScreenHandle();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFullWindow, setIsFullWindow] = useState(false);
  const [showToolBar, setShowToolBar] = useState(false);
  const [showVoiceBar, setShowVoiceBar] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [voice, setVoice] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [selectChapter, setSelectChpter] = useState(0);
  const [selectUnit, setSelectUnit] = useState(0);
  const [courseData, setCourseData] = useState<CourseDataInteface>();

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

  const videoHandler = (control: string) => {
    if (!videoRef.current) return;
    switch (control) {
      case "play": {
        videoRef.current.play();
        setIsPlaying(true);
        setVideoTime(videoRef.current.duration);
        setVoice(videoRef.current.volume * 100);
        break;
      }
      case "pause": {
        videoRef.current.pause();
        setIsPlaying(false);
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
      case "mute": {
        setIsMute(true);
        videoRef.current.muted = true;
        break;
      }
      case "voice": {
        setIsMute(false);
        videoRef.current.muted = false;
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
        <CourseRoom>
          <FullScreen
            handle={handle}
            onChange={(e) => {
              setIsFullScreen(e);
            }}
          >
            <VideoContainer
              isFullScreen={isFullScreen}
              isFullWindow={isFullWindow}
              onMouseOver={() => {
                setShowToolBar(true);
              }}
              onMouseOut={() => {
                setShowToolBar(false);
              }}
              onMouseMove={() => {
                clearTimeout(timeoutRef.current);
                setShowToolBar(true);
                timeoutRef.current = setTimeout(() => {
                  setShowToolBar(false);
                }, 5000);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  videoHandler("forward");
                } else if (e.key === "ArrowLeft") {
                  videoHandler("rewind");
                } else if (e.key === " ") {
                  videoHandler(isPlaying ? "pause" : "play");
                }
              }}
            >
              <Video
                src={courseData?.chapters[selectChapter].units[selectUnit].video}
                autoPlay
                isFullScreen={isFullScreen}
                isFullWindow={isFullWindow}
                showToolBar={showToolBar}
                onEnded={handleSwitch}
                onClick={() => {
                  if (isPlaying) {
                    videoHandler("pause");
                  } else {
                    videoHandler("play");
                  }
                }}
                onTimeUpdate={() => {
                  if (!videoRef.current) return;
                  setCurrentTime(videoRef.current?.currentTime);
                  setProgress((videoRef.current.currentTime / videoTime) * 100);
                  setVideoTime(videoRef.current.duration);
                }}
                ref={videoRef}
              />
              {showToolBar && (
                <ToolBar>
                  <PlayControls>
                    <ControlIcon
                      onClick={() => {
                        videoHandler("rewind");
                      }}
                    >
                      <Image src={Rewind} alt="rewind" fill sizes="contain" />
                    </ControlIcon>
                    {isPlaying === false ? (
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
                  <TimeControls>
                    <ControlTime>
                      {`${Math.floor(currentTime / 60)}:${`0${Math.floor(currentTime % 60)}`.slice(-2)}`}
                    </ControlTime>
                    <TimeProgressBarContainer
                      onClick={(e) => {
                        if (!videoRef.current) return;
                        const target = e.currentTarget as HTMLDivElement;
                        const timeAtProgressBar =
                          (e.nativeEvent.offsetX / target.scrollWidth) * videoRef.current.duration;
                        videoRef.current.currentTime = timeAtProgressBar;
                        setCurrentTime(timeAtProgressBar);
                      }}
                    >
                      <TimeProgressBar style={{ width: `${progress}%` }} />
                    </TimeProgressBarContainer>
                    <ControlTime>{`${Math.floor(videoTime / 60)}:${`0${Math.floor(videoTime % 60)}`.slice(
                      -2
                    )}`}</ControlTime>
                  </TimeControls>
                  <OtherControls>
                    <ControlIcon
                      onMouseOver={() => {
                        setShowVoiceBar(true);
                      }}
                      onMouseOut={() => {
                        setShowVoiceBar(false);
                      }}
                    >
                      {showVoiceBar && (
                        <VoiceBarContainer
                          onClickCapture={(e) => {
                            if (!videoRef.current) return;
                            if (e.target === e.currentTarget) {
                              const volume = Math.abs(e.nativeEvent.offsetY - 100);
                              videoRef.current.volume = volume / 100;
                              setVoice(volume);
                            } else {
                              const volume = Math.abs(e.nativeEvent.offsetY - voice);
                              videoRef.current.volume = volume / 100;
                              setVoice(volume);
                            }
                          }}
                        >
                          <VoiceBar height={voice} />
                        </VoiceBarContainer>
                      )}
                      <Image
                        src={isMute ? Mute : Voice}
                        alt="voice"
                        fill
                        sizes="contain"
                        onClick={() => {
                          videoHandler(isMute ? "voice" : "mute");
                        }}
                      />
                    </ControlIcon>
                    <ControlIcon
                      onMouseOver={() => {
                        setShowSpeedMenu(true);
                      }}
                      onMouseOut={() => {
                        setShowSpeedMenu(false);
                      }}
                    >
                      {showSpeedMenu && (
                        <SpeedMenu>
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2].map((rate) => (
                            <SpeedOption
                              key={rate}
                              onClick={() => {
                                if (!videoRef.current) return;
                                videoRef.current.playbackRate = rate;
                                setSpeed(rate);
                              }}
                            >
                              {speed === rate && (
                                <PlayIcon>
                                  <Image src={Play} alt="play" fill sizes="contain" />
                                </PlayIcon>
                              )}
                              {rate}x
                            </SpeedOption>
                          ))}
                        </SpeedMenu>
                      )}
                      <Image src={Speed} alt="speed" fill sizes="contain" />
                    </ControlIcon>
                    <ControlIcon
                      onClick={() => {
                        if (!isFullWindow) {
                          setIsFullWindow(true);
                        } else {
                          setIsFullWindow(false);
                        }
                      }}
                    >
                      <Image src={FullWindow} alt="full-screen" fill sizes="contain" />
                    </ControlIcon>
                    <ControlIcon
                      onClick={() => {
                        if (!isFullScreen) {
                          handle.enter();
                          setIsFullScreen(true);
                        } else {
                          handle.exit();
                          setIsFullScreen(false);
                        }
                      }}
                    >
                      <Image src={FullScreenIcon} alt="full-screen" fill sizes="contain" />
                    </ControlIcon>
                  </OtherControls>
                </ToolBar>
              )}
            </VideoContainer>
          </FullScreen>
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
