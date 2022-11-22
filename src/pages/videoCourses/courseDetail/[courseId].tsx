import React, { useState, useEffect, useRef, useContext } from "react";
import Image from "next/image";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/router";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useRecoilState } from "recoil";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { db } from "../../../../lib/firebase";
import { AuthContext } from "../../../contexts/authContext";
import { orderQtyState, showMemberModalState } from "../../../../lib/recoil";
import Lock from "../../../../public/lock.png";
import Play from "../../../../public/play.png";
import Pause from "../../../../public/pause.png";
import Forward from "../../../../public/forward.png";
import Rewind from "../../../../public/rewind.png";
import Voice from "../../../../public/voice.png";
import Mute from "../../../../public/mute.png";
import Speed from "../../../../public/speed.png";
import FullScreenIcon from "../../../../public/full-screen.png";
import FullWindow from "../../../../public/full-window.png";
import Avatar from "../../../../public/member.png";
import Star from "../../../../public/star.png";
import HalfStar from "../../../../public/star-half.png";
import Loading from "../../../../public/loading.gif";
import "react-quill/dist/quill.snow.css";

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
  align-items: center;
  width: 100%;
  height: 610px;
  background-image: ${(props) => `url(${props.backgroundImage})`};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 50px;
  padding: calc((610px - 417px - 60px - 63.5px) / 2);
  &::before {
    content: "";
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    height: 610px;
    background-color: #e9dfc799;
    backdrop-filter: blur(12px);
  }
  @media screen and (max-width: 1188px) {
    height: auto;
    &::before {
      height: auto;
    }
  }
`;
const Title = styled.h2`
  font-size: 40px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.color2};
  margin-bottom: 20px;
  z-index: 8;
  @media screen and (max-width: 800px) {
    font-size: 32px;
  }
`;
const CourseRoom = styled.div`
  display: flex;
  @media screen and (max-width: 1188px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;
const VideoContainer = styled.div<{ isFullScreen: boolean; isFullWindow: boolean }>`
  position: ${(props) => (props.isFullWindow ? "fixed" : "relative")};
  top: ${(props) => props.isFullWindow && "0"};
  left: ${(props) => props.isFullWindow && "0"};
  z-index: ${(props) => props.isFullWindow && "88"};
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  background-color: ${(props) => props.theme.colors.color6};
  @media screen and (max-width: 1188px) {
    margin-bottom: 20px;
  }
  @media screen and (max-width: 760px) {
    width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "98vw")};
  }
  @media screen and (max-width: 600px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "300px")};
  }
  @media screen and (max-width: 500px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "240px")};
  }
`;
const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 754px;
  height: 417px;
  background-color: transparent;
`;

const Video = styled.video<{ isFullScreen: boolean; showToolBar: boolean; isFullWindow: boolean }>`
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  margin-bottom: 20px;
  cursor: ${(props) => props.showToolBar === false && "none"};
  @media screen and (max-width: 760px) {
    width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "98vw")};
  }
`;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  width: 120px;
  padding: 10px;
  margin-top: 20px;
  z-index: 8;
  cursor: pointer;
`;
const ChapterSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 406px;
  height: 417px;
  color: ${(props) => props.theme.colors.color1};
  background-color: ${(props) => props.theme.colors.color6};
  padding-top: 20px;
  overflow-y: auto;
  z-index: 8;
  @media screen and (max-width: 555px) {
    width: 98%;
  }
`;
const SubTitle = styled.h3`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  @media screen and (max-width: 555px) {
    font-size: 20px;
  }
`;
const CourseTitle = styled.div`
  color: ${(props) => props.theme.colors.color5};
  background-color: ${(props) => props.theme.colors.color3};
  font-size: 20px;
  line-height: 38px;
  border-bottom: 1px solid #fff;
  padding: 10px 0 10px 10px;
  margin-bottom: 10px;
  width: 100%;
  @media screen and (max-width: 555px) {
    font-size: 18px;
  }
`;
const PlayIconWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const Chapters = styled.ul`
  margin-bottom: 30px;
  width: 100%;
`;
const Chapter = styled.li``;
const ChapterTitle = styled.h4`
  font-size: 20px;
  line-height: 26px;
  border-bottom: 1px solid #fff;
  padding-left: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  margin-top: 20px;
  @media screen and (max-width: 555px) {
    font-size: 18px;
  }
`;
const Units = styled.ul`
  padding: 0 10px;
`;
const Unit = styled.li`
  border-bottom: 1px solid #fff;
  padding: 20px 0;
  padding-left: 20px;
`;
const UnitTitle = styled.h5`
  display: flex;
  align-items: center;
  font-size: 18px;
  line-height: 20px;
  @media screen and (max-width: 555px) {
    font-size: 16px;
  }
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
  @media screen and (max-width: 760px) {
    width: 98vw;
  }
  @media screen and (max-width: 555px) {
    padding: 10px 10px;
  }
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
  @media screen and (max-width: 724px) {
    width: 300px;
  }
  @media screen and (max-width: 655px) {
    width: 250px;
  }
  @media screen and (max-width: 588px) {
    width: 180px;
  }
  @media screen and (max-width: 488px) {
    width: 120px;
  }
  @media screen and (max-width: 412px) {
    width: 80px;
  }
`;
const TimeProgressBar = styled.div`
  border-radius: 15px;
  background-color: ${(props) => props.theme.colors.color3};
  height: 100%;
  filter: brightness(110%);
`;
const ControlTime = styled.p`
  color: ${(props) => props.theme.colors.color1};
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
  background-color: ${(props) => props.theme.colors.color3};
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
  @media screen and (max-width: 488px) {
    width: 66px;
    transform: translate(-24px, 10px);
  }
`;
const SpeedOption = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.color1};
  font-size: 18px;
  line-height: 24px;
  height: 36px;
  padding: 5px;
  text-align: center;
  &:hover {
    background-color: ${(props) => props.theme.colors.color3};
  }
  @media screen and (max-width: 488px) {
    font-size: 15px;
    line-height: 20px;
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
  @media screen and (max-width: 555px) {
    width: 16px;
    height: 16px;
    &:last-child {
      margin-right: 0;
    }
  }
`;
const ControlIconFullWindow = styled(ControlIcon)`
  @media screen and (max-width: 760px) {
    display: none;
  }
`;
const CourseDetailContainer = styled.div`
  color: ${(props) => props.theme.colors.color2};
  max-width: 800px;
  margin: 0 auto;
  @media screen and (max-width: 866px) {
    max-width: 96%;
  }
`;
const Introduction = styled.div`
  color: ${(props) => props.theme.colors.color7};
  font-size: 18px;
  line-height: 36px;
  margin-bottom: 50px;
  @media screen and (max-width: 866px) {
    font-size: 16px;
  }
`;
const About = styled.div`
  display: flex;
`;
const TeacherInfo = styled.div`
  color: ${(props) => props.theme.colors.color7};
  margin-right: 10px;
  cursor: pointer;
`;
const TeacherWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
  overflow: hidden;
  @media screen and (max-width: 866px) {
    width: 40px;
    height: 40px;
  }
`;
const TeacherName = styled.p`
  text-align: center;
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
  background-color: ${(props) => props.theme.colors.color8};
  border-radius: 5px;
  width: 100%;
  height: 150px;
  padding: 24px;
  margin-bottom: 20px;
`;
const User = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 80px;
  @media screen and (max-width: 866px) {
    margin-right: 50px;
  }
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
  @media screen and (max-width: 866px) {
    font-size: 16px;
  }
`;

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

function VideoPlayer({ introductionVideo }: { introductionVideo: string | undefined }) {
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

  if (!introductionVideo)
    return (
      <LoadingWrapper>
        <Image src={Loading} alt="loading" width={100} height={100} />
      </LoadingWrapper>
    );

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
  return (
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
          src={introductionVideo}
          autoPlay
          isFullScreen={isFullScreen}
          isFullWindow={isFullWindow}
          showToolBar={showToolBar}
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
                  const timeAtProgressBar = (e.nativeEvent.offsetX / target.scrollWidth) * videoRef.current.duration;
                  videoRef.current.currentTime = timeAtProgressBar;
                  setCurrentTime(timeAtProgressBar);
                }}
              >
                <TimeProgressBar style={{ width: `${progress}%` }} />
              </TimeProgressBarContainer>
              <ControlTime>{`${Math.floor(videoTime / 60)}:${`0${Math.floor(videoTime % 60)}`.slice(-2)}`}</ControlTime>
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
              <ControlIconFullWindow
                onClick={() => {
                  if (isFullScreen) return;
                  if (!isFullWindow) {
                    setIsFullWindow(true);
                  } else {
                    setIsFullWindow(false);
                  }
                }}
              >
                <Image src={FullWindow} alt="full-window" fill sizes="contain" />
              </ControlIconFullWindow>
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
  );
}
interface CourseDetailProps {
  courseData: CourseDataInteface;
  teacherData: Record<string, string>;
  reviewsUsersDatas: { index: number; username: string; avatar: string }[];
}

function CourseDetail({ courseData, teacherData, reviewsUsersDatas }: CourseDetailProps) {
  const router = useRouter();

  return (
    <CourseDetailContainer>
      <SubTitle>課程特色</SubTitle>
      <Introduction className="ql-editor" dangerouslySetInnerHTML={{ __html: courseData.introduction }} />
      <SubTitle>關於老師</SubTitle>
      <About>
        <TeacherInfo
          onClick={() => {
            router.push(`/findTeachers/reserve/${courseData.teacherId}`);
          }}
        >
          <TeacherWrapper>
            <Image src={teacherData.teacherAvatar} alt="avatar" width={120} height={120} />
          </TeacherWrapper>
          <TeacherName>{teacherData.teacherName}</TeacherName>
        </TeacherInfo>
        <Introduction className="ql-editor" dangerouslySetInnerHTML={{ __html: teacherData.teacherExprience }} />
      </About>
      <SubTitle>課程評價</SubTitle>
      <ScoreContainer>
        <Average>
          {(courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length || 0).toFixed(1) ||
            0}
        </Average>
        <ReviewsInfo>
          <StarIcons>
            {Array.from(
              {
                length: Math.floor(
                  courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length
                ),
              },
              (v, i) => i + 1
            ).map((starIndex) => (
              <StarWrapper key={starIndex}>
                <Image src={Star} alt="star" fill sizes="contain" />
              </StarWrapper>
            ))}
            {(courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length) % 1 !== 0 && (
              <StarWrapper>
                <Image src={HalfStar} alt="star" fill sizes="contain" />
              </StarWrapper>
            )}
          </StarIcons>
          <ReviewQty>{courseData.reviews.length} 則評價</ReviewQty>
        </ReviewsInfo>
      </ScoreContainer>
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
                <Comments>{review.comments}</Comments>
              </CommentWrapper>
            </Review>
          ))}
      </Reviews>
    </CourseDetailContainer>
  );
}

function CourseInfo() {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState<CourseDataInteface>();
  const [boughtCourses, setBoughtCourses] = useState<string[]>();
  const [teacherData, setTeacherData] = useState<Record<string, string>>();
  const [reviewsUsersDatas, setReviewsUsersDatas] = useState<{ index: number; username: string; avatar: string }[]>([]);
  const { isLogin, userData } = useContext(AuthContext);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);

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

        if (typeof teacherId !== "string") return;
        const teacherRef = doc(db, "users", teacherId);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) {
          const teacherName = teacherSnap.data().username as string;
          const teacherAvatar = teacherSnap.data().photoURL as string;
          const teacherIntroduction = teacherSnap.data().teacher_introduction as string;
          const teacherExprience = teacherSnap.data().teacher_exprience as string;
          setTeacherData({ teacherName, teacherAvatar, teacherIntroduction, teacherExprience });
        }

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

  const addToCart = async () => {
    if (!isLogin) {
      Swal.fire({ title: "請先登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      setShowMemberModal(true);
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
    Swal.fire({ title: "已加入購物車！", confirmButtonColor: "#5d7262", icon: "success" });
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const qty: number = docSnap.data()?.cartItems?.length;
      setOrderQty(qty);
    }
  };

  return (
    <Wrapper>
      <CourseContainer backgroundImage={courseData?.cover || ""}>
        <Title>{courseData?.name}</Title>
        <CourseRoom>
          <VideoPlayer introductionVideo={courseData?.introductionVideo} />
          <ChapterSelector>
            <SubTitle>課程章節</SubTitle>
            <CourseTitle>
              <PlayIconWrapper>
                <PlayIcon>
                  <Image src={Play} alt="play" fill sizes="contain" />
                </PlayIcon>
                課程介紹影片
              </PlayIconWrapper>
            </CourseTitle>
            <Chapters>
              {courseData?.chapters.map((chapter, chapterIndex) => (
                <Chapter key={chapter.id}>
                  <ChapterTitle>
                    章節 {chapterIndex + 1}：{chapter.title}
                  </ChapterTitle>
                  {chapter.units.map((unit, unitIndex) => (
                    <Units key={unit.id}>
                      <Unit>
                        <UnitTitle>
                          <PlayIcon>
                            <Image src={Lock} alt="lock" fill sizes="contain" />
                          </PlayIcon>
                          單元 {unitIndex + 1}：{unit.title}
                        </UnitTitle>
                      </Unit>
                    </Units>
                  ))}
                </Chapter>
              ))}
            </Chapters>
          </ChapterSelector>
        </CourseRoom>
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
      </CourseContainer>
      {courseData && teacherData && (
        <CourseDetail courseData={courseData} teacherData={teacherData} reviewsUsersDatas={reviewsUsersDatas} />
      )}
    </Wrapper>
  );
}

export default CourseInfo;
