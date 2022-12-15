import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";
import Swal from "sweetalert2";
import Head from "next/head";
import { getUserData, getVideoCourse } from "../../../../utils/firestore";
import { AuthContext } from "../../../../contexts/authContext";
import VideoPlayer from "../../../../components/videoCourse/videoPlayer";
import CourseDetail from "../../../../components/videoCourse/courseDetail";
import Play from "../../../../../public/play.png";
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
