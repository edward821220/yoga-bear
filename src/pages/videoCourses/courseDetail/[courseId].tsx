import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useRecoilState } from "recoil";
import { getVideoCourse, getUserData, updateCartItem } from "../../../utils/firestore";
import { AuthContext } from "../../../contexts/authContext";
import { orderQtyState, showMemberModalState } from "../../../utils/recoil";
import VideoPlayer from "../../../components/videoCourse/videoPlayer";
import CourseDetail from "../../../components/videoCourse/courseDetail";
import Lock from "../../../../public/lock.png";
import Play from "../../../../public/play.png";
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

function CourseInfo({ courseId, courseData }: { courseId: string; courseData: CourseDataInterface }) {
  const router = useRouter();
  const [boughtCourses, setBoughtCourses] = useState<string[]>();
  const [teacherData, setTeacherData] = useState<Record<string, string>>();
  const [reviewsUsersData, setReviewsUsersData] = useState<{ index: number; username: string; avatar: string }[]>([]);
  const { isLogin, userData } = useContext(AuthContext);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  useEffect(() => {
    const getBoughtCourses = async () => {
      if (!userData.uid) return;
      const docSnap = await getUserData(userData.uid);
      if (docSnap.exists()) {
        const courses = docSnap.data().boughtCourses as string[];
        setBoughtCourses(courses);
      }
    };
    getBoughtCourses();
  }, [userData.uid]);

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

  const addToCart = async () => {
    if (!isLogin) {
      Swal.fire({ title: "請先登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
      setShowMemberModal(true);
      return;
    }
    updateCartItem(userData.uid, courseData);
    Swal.fire({ title: "已加入購物車！", confirmButtonColor: "#5d7262", icon: "success" });
    const docSnap = await getUserData(userData.uid);
    if (docSnap.exists()) {
      const cartItems = docSnap.data().cartItems as [];
      const qty = cartItems.length;
      setOrderQty(qty);
    }
  };

  return (
    <>
      <Head>
        <title>{courseData.name} - Yoga Bear</title>
      </Head>
      <Wrapper>
        <CourseContainer backgroundImage={courseData?.cover || ""}>
          <Title>{courseData?.name}</Title>
          <CourseRoom>
            <VideoPlayer src={courseData?.introductionVideo} />
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
                router.push(`/myCourses/classRoom/videoCourseRoom/${courseId}`);
              }}
            >
              前往課程
            </Button>
          )}
        </CourseContainer>
        {courseData && teacherData && (
          <CourseDetail
            isLogin={isLogin}
            setShowMemberModal={setShowMemberModal}
            courseData={courseData}
            teacherData={teacherData}
            reviewsUsersData={reviewsUsersData}
          />
        )}
      </Wrapper>
    </>
  );
}

export default CourseInfo;

export async function getServerSideProps({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const courseData = await getVideoCourse(courseId);
  return { props: { courseId, courseData } };
}
