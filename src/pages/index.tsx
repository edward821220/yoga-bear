import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Avatar from "../../public/member.png";
import Bear from "../../public/bear-logo1.png";
import BannerPic from "../../public/yoga-beach.jpeg";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Wrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 100px);
  background-color: ${(props) => props.theme.colors.color1};
  .swiper {
    width: 100%;
    height: 100%;
  }
  .swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #fff;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }
  .swiper-slide {
    padding-bottom: 20px;
    margin-top: 40px;
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .swiper-button-prev {
    color: #5d7262;
  }
  .swiper-button-next {
    color: #5d7262;
  }
  .swiper-pagination-bullet {
    background-color: #5d7262;
  }
`;
const Banner = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  max-height: 400px;
  overflow: hidden;
`;
const BannerImage = styled(Image)`
  height: auto;
  width: 100%;
  transform: translate(0, -30%);
`;
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;
const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => props.theme.colors.color2};
  margin-top: 40px;
`;
const Reasons = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`;
const Reason = styled.li`
  flex-basis: 48%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  margin-bottom: 50px;
`;
const Course = styled.div``;
const CoverWrapper = styled.div`
  position: relative;
  width: 360px;
  height: 200px;
  margin-bottom: 10px;
`;
const AvatarWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
`;
const Info = styled.p`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.color2};
  margin-bottom: 10px;
`;
const BearWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface CoursesListInterface {
  id: string;
  cover: string;
  name: string;
  price: number;
}
interface TeachersListInterface {
  id: string;
  avatar: string;
  name: string;
}
export default function Home() {
  const [coursesList, setCoursesList] = useState<CoursesListInterface[]>();
  const [teachersList, setTeachersList] = useState<TeachersListInterface[]>();
  useEffect(() => {
    const getCourses = async () => {
      const coursesRef = collection(db, "video_courses");
      const q = query(coursesRef, where("price", "<", 2000), limit(9));
      const querySnapshot = await getDocs(q);
      const results: CoursesListInterface[] = [];
      querySnapshot.forEach((data) => {
        const { id, cover, name, price } = data.data();
        results.push({ id, cover, name, price });
      });
      setCoursesList(results);
    };
    getCourses();
  }, []);

  useEffect(() => {
    const getTeachers = async () => {
      const coursesRef = collection(db, "users");
      const q = query(coursesRef, where("identity", "==", "teacher"), limit(12));
      const querySnapshot = await getDocs(q);
      const results: TeachersListInterface[] = [];
      querySnapshot.forEach((data) => {
        const { id, photoURL: avatar, username: name } = data.data();
        results.push({ id, avatar, name });
      });
      setTeachersList(results);
    };
    getTeachers();
  }, []);
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
      </Head>
      <Wrapper>
        <Banner>
          <BannerImage src={BannerPic} alt="banner" />
        </Banner>
        <Container>
          <Title>四個愛上 Yoga Bear 的理由</Title>
          <Reasons>
            <Reason>任選上課時間</Reason>
            <Reason>專屬你的課程</Reason>
            <Reason>1 堂也能買</Reason>
            <Reason>自選上課老師</Reason>
          </Reasons>
          <Title>推薦課程</Title>
          <Swiper
            slidesPerView={3}
            spaceBetween={200}
            slidesPerGroup={3}
            loop
            loopFillGroupWithBlank
            pagination={{
              clickable: true,
            }}
            navigation
            modules={[Pagination, Navigation]}
            className="mySwiper"
          >
            {coursesList?.map((course) => (
              <SwiperSlide key={course.id}>
                <Course>
                  <CoverWrapper>
                    <Image src={course.cover} alt="cover" fill sizes="contain" />
                  </CoverWrapper>
                  <Info>{course.name}</Info>
                  <Info>TWD.{course.price}</Info>
                </Course>
              </SwiperSlide>
            ))}
          </Swiper>
          <Title>推薦老師</Title>
          <Swiper
            slidesPerView={4}
            spaceBetween={100}
            slidesPerGroup={4}
            loop
            loopFillGroupWithBlank
            pagination={{
              clickable: true,
            }}
            navigation
            modules={[Pagination, Navigation]}
            className="mySwiper"
          >
            {teachersList?.map((teacher) => (
              <SwiperSlide key={teacher.id}>
                <Course>
                  <AvatarWrapper>
                    <Image src={teacher.avatar || Avatar} alt="cover" fill sizes="contain" />
                  </AvatarWrapper>
                  <Info>{teacher.name}</Info>
                </Course>
              </SwiperSlide>
            ))}
          </Swiper>
          <BearWrapper>
            <Image src={Bear} alt="bear" width={500} />
          </BearWrapper>
        </Container>
      </Wrapper>
    </>
  );
}
