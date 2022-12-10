import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";
import Swal from "sweetalert2";
import parse from "html-react-parser";
import Head from "next/head";
import { getUserData, getVideoCourse } from "../../../../utils/firestore";
import { AuthContext } from "../../../../contexts/authContext";
import VideoPlayer from "../../../../components/videoCourses/videoPlayer";
import Play from "../../../../../public/play.png";
import Avatar from "../../../../../public/member.png";
import Star from "../../../../../public/star.png";
import HalfStar from "../../../../../public/star-half.png";
import Loading from "../../../../../public/loading.gif";
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
  padding: calc((610px - 417px - 60px) / 2);
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
const Unit = styled.li<{ focus: boolean }>`
  color: ${(props) => props.focus && props.theme.colors.color5};
  background-color: ${(props) => props.focus && props.theme.colors.color3};
  border-bottom: 1px solid #fff;
  padding: 20px 0;
  padding-left: 20px;
  cursor: pointer;
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
  position: relative;
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
  position: relative;
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
`;
const Comments = styled.p`
  font-size: 18px;
  word-wrap: break-word;
  @media screen and (max-width: 866px) {
    font-size: 16px;
  }
`;

interface ChapterInterface {
  id: number;
  title: string;
  units: { id: number; title: string; video: string }[];
}
interface ReviewInterface {
  comments: string;
  score: number;
  userId: string;
}
interface CourseDataInterface {
  id: string;
  name: string;
  chapters: ChapterInterface[];
  introduction: string;
  introductionVideo: string;
  teacherId: string;
  cover: string;
  price: string;
  reviews: ReviewInterface[];
}
interface CourseDetailProps {
  courseData: CourseDataInterface;
  teacherData: Record<string, string>;
  reviewsUsersData: { index: number; username: string; avatar: string }[];
}

function CourseDetail({ courseData, teacherData, reviewsUsersData }: CourseDetailProps) {
  const router = useRouter();

  return (
    <CourseDetailContainer>
      <SubTitle>課程特色</SubTitle>
      <Introduction className="ql-editor">{parse(courseData.introduction)}</Introduction>
      <SubTitle>關於老師</SubTitle>
      <About>
        <TeacherInfo
          onClick={() => {
            router.push(`/findTeachers/reserve/${courseData.teacherId}`);
          }}
        >
          <TeacherWrapper>
            <Image src={teacherData.teacherAvatar} alt="avatar" fill sizes="contain " style={{ objectFit: "cover" }} />
          </TeacherWrapper>
          <TeacherName>{teacherData.teacherName}</TeacherName>
        </TeacherInfo>
        <Introduction className="ql-editor">{parse(teacherData.teacherExperience)}</Introduction>
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
                      reviewsUsersData.find((reviewUserData) => reviewUserData.index === reviewIndex)?.avatar || Avatar
                    }
                    alt="avatar"
                    fill
                    sizes="contain"
                    style={{ objectFit: "cover" }}
                  />
                </AvatarWrapper>
                <UserName>
                  {reviewsUsersData.find((reviewUserData) => reviewUserData.index === reviewIndex)?.username}
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

function VideoRoom({ courseId, courseData }: { courseId: string; courseData: CourseDataInterface }) {
  const router = useRouter();
  const [boughtCourses, setBoughtCourses] = useState<string[]>();
  const [selectChapter, setSelectChapter] = useState(0);
  const [selectUnit, setSelectUnit] = useState(0);
  const [teacherData, setTeacherData] = useState<Record<string, string>>();
  const [reviewsUsersData, setReviewsUsersData] = useState<{ index: number; username: string; avatar: string }[]>([]);
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const getBoughtCourses = async () => {
      if (!userData.uid) return;
      const docSnap = await getUserData(userData.uid);
      if (docSnap.exists()) {
        const courses = docSnap.data().boughtCourses as string[];
        setBoughtCourses(courses);
        if (!courses.includes(courseId) && userData.uid !== courseData.teacherId) {
          Swal.fire({ text: "您沒有購買此課程唷！", confirmButtonColor: "#5d7262", icon: "warning" });
          router.push("/");
        }
      }
    };
    getBoughtCourses();
  }, [userData.uid, courseId, router, courseData.teacherId]);

  useEffect(() => {
    const getCourseInfo = async () => {
      const teacherSnap = await getUserData(courseData.teacherId);
      if (teacherSnap.exists()) {
        const teacherName = teacherSnap.data().username as string;
        const teacherAvatar = teacherSnap.data().photoURL as string;
        const teacherIntroduction = teacherSnap.data().teacher_introduction as string;
        const teacherExperience = teacherSnap.data().teacher_experience as string;
        setTeacherData({ teacherName, teacherAvatar, teacherIntroduction, teacherExperience });
      }

      if (!Array.isArray(courseData.reviews)) return;
      courseData.reviews.forEach(async (review: { comments: string; score: number; userId: string }, index) => {
        const userSnap = await getUserData(review.userId);
        if (!userSnap.exists()) return;
        const username = userSnap.data().username as string;
        const avatar = userSnap.data().photoURL as string;
        setReviewsUsersData((prev) => [...prev, { index, username, avatar }]);
      });
    };
    getCourseInfo();
  }, [courseData.teacherId, courseData.reviews]);

  const handleSelect = (chapterIndex: number, unitIndex: number) => {
    setSelectChapter(chapterIndex);
    setSelectUnit(unitIndex);
  };

  const handleSwitch = () => {
    if (!courseData) return;
    if (courseData.chapters[selectChapter].units[selectUnit + 1]?.video) {
      setSelectUnit((prev) => prev + 1);
    } else if (courseData.chapters[selectChapter + 1]?.units[0].video) {
      setSelectUnit(0);
      setSelectChapter((prev) => prev + 1);
    } else {
      Swal.fire({ text: "恭喜您完課！", confirmButtonColor: "#5d7262", icon: "success" });
    }
  };

  if (!boughtCourses)
    return (
      <Wrapper style={{ justifyContent: "center" }}>
        <Image src={Loading} alt="loading" width={100} height={100} />
      </Wrapper>
    );

  return (
    <>
      <Head>
        <title>{courseData.name} - Yoga Bear</title>
      </Head>
      <Wrapper>
        <CourseContainer backgroundImage={courseData?.cover || ""}>
          <Title>{courseData?.name}</Title>
          {typeof courseId === "string" &&
          boughtCourses &&
          (boughtCourses.includes(courseId) || courseData.teacherId === userData.uid) ? (
            <CourseRoom>
              <VideoPlayer
                handleSwitch={handleSwitch}
                src={courseData.chapters[selectChapter].units[selectUnit].video}
              />
              <ChapterSelector>
                <SubTitle>課程章節</SubTitle>
                <Chapters>
                  {courseData?.chapters.map((chapter, chapterIndex) => (
                    <Chapter key={chapter.id}>
                      <ChapterTitle>
                        章節 {chapterIndex + 1}：{chapter.title}
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
                              <PlayIcon>
                                <Image src={Play} alt="play" fill sizes="contain" />
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
          ) : (
            <p style={{ fontSize: "24px", zIndex: 8 }}>您沒有購買此課程唷！</p>
          )}
        </CourseContainer>
        {courseData && teacherData && (
          <CourseDetail courseData={courseData} teacherData={teacherData} reviewsUsersData={reviewsUsersData} />
        )}
      </Wrapper>
    </>
  );
}

export default VideoRoom;

export async function getServerSideProps({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const courseData = await getVideoCourse(courseId);

  return { props: { courseId, courseData } };
}
