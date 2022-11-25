import { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Bear from "../../public/bear-logo1.png";
import BannerPic from "../../public/banner6.jpg";
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
    margin-top: 60px;
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
  opacity: 0.85;
  filter: brightness(85%);
`;
const BannerImage = styled(Image)`
  height: auto;
  width: 100%;
  transform: translate(0, -32%);
  @media screen and (max-width: 888px) {
    transform: translate(0, -10%);
  }
  @media screen and (max-width: 388px) {
    transform: translate(0, 0);
  }
`;
const SloganContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
`;
const Slogan = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000;
  text-shadow: gray 0.1em 0.1em 0.2em;
  @media screen and (max-width: 900px) {
    font-size: 24px;
  }
  @media screen and (max-width: 660px) {
    font-size: 20px;
  }
  @media screen and (max-width: 500px) {
    font-size: 18px;
    margin-bottom: 5px;
  }
`;
const SubSlogan = styled.h2`
  font-size: 22px;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: black 0.1em 0.1em 0.2em;
  @media screen and (max-width: 900px) {
    font-size: 18px;
  }
  @media screen and (max-width: 660px) {
    font-size: 16px;
  }
  @media screen and (max-width: 500px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;
const SearchBox = styled.form`
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000098;
  border-radius: 5px;
  margin-bottom: 10px;
  min-width: 320px;
  @media screen and (max-width: 500px) {
    min-width: 280px;
  }
`;
const SearchInput = styled.input`
  font-size: 18px;
  padding: 10px;
  width: 100%;
  height: 40px;
  border: none;
  &:focus {
    outline: none;
  }
  @media screen and (max-width: 650px) {
    font-size: 14px;
    height: 28px;
  }
`;
const SearchLabel = styled.label`
  margin-right: 10px;
  color: #000;
  text-shadow: #fff 0.1em 0.1em 0.2em;
  @media screen and (max-width: 650px) {
    font-size: 14px;
  }
  @media screen and (max-width: 450px) {
    font-size: 12px;
  }
`;
const SearchRadio = styled.input`
  margin-right: 5px;
`;
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  @media screen and (max-width: 1280px) {
    max-width: 92%;
  }
`;
const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => props.theme.colors.color2};
  margin-top: 60px;
  @media screen and (max-width: 888px) {
    font-size: 26px;
  }
  @media screen and (max-width: 388px) {
    font-size: 24px;
  }
`;
const Reasons = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
  gap: 60px 0;
  @media screen and (max-width: 1280px) {
    gap: 40px 10px;
  }
`;
const Reason = styled.li`
  flex-basis: 48%;
  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 1280px) {
    flex-basis: 36%;
  }
  @media screen and (max-width: 888px) {
    flex-basis: 100%;
  }
`;
const ReasonIcon = styled(Image)`
  width: 50px;
  height: auto;
  margin-right: 20px;
`;
const ReasonContent = styled.div`
  border-left: 1px solid ${(props) => props.theme.colors.color2};
  padding-left: 10px;
  width: 240px;
  @media screen and (max-width: 1280px) {
    width: 240px;
  }
`;
const ReasonTitle = styled.h4`
  font-size: 20px;
  line-height: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.color3};
`;
const ReasonText = styled.p`
  color: ${(props) => props.theme.colors.color7};
  line-height: 24px;
`;
const Course = styled.div`
  cursor: pointer;
`;
const CoverWrapper = styled.div`
  position: relative;
  width: 360px;
  height: 200px;
  margin-bottom: 10px;
`;
const AvatarWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
`;
const Info = styled.p`
  font-size: 20px;
  color: ${(props) => props.theme.colors.color7};
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

export default function Home({
  coursesList,
  teachersList,
}: {
  coursesList: CoursesListInterface[];
  teachersList: TeachersListInterface[];
}) {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("course");
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
      </Head>
      <Wrapper>
        <Banner>
          <BannerImage src={BannerPic} alt="banner" />
          <SloganContainer>
            <Slogan>瑜伽練習者的好夥伴</Slogan>
            <SubSlogan>讓 Yoga Bear 幫你找到適合自己的老師！</SubSlogan>
            <SearchBox
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (category === "course") router.push(`/videoCourses?keywords=${keywords}`);
                if (category === "teacher") router.push(`/findTeachers?keywords=${keywords}`);
              }}
            >
              <SearchInput
                placeholder={category === "course" ? "你想學什麼呢？" : "你想找哪個老師呢？"}
                value={keywords}
                onChange={(e) => {
                  setKeywords(e.target.value);
                }}
              />
            </SearchBox>
            <SearchLabel>
              <SearchRadio
                type="radio"
                value="course"
                name="category"
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              />
              找課程
            </SearchLabel>
            <SearchLabel>
              <SearchRadio
                type="radio"
                value="teacher"
                name="category"
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              />
              找老師
            </SearchLabel>
          </SloganContainer>
        </Banner>
        <Container>
          <Title>四個愛上 Yoga Bear 的理由</Title>
          <Reasons>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/ios-filled/100/5d7262/calendar--v1.png"
                alt="calendar"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>任選上課時間</ReasonTitle>
                <ReasonText>自己從課表挑選時間，方便學習沒有壓力</ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/ios-filled/100/5d7262/student-center.png"
                alt="student"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>專屬你的課程</ReasonTitle>
                <ReasonText>依照能力、需求、喜好，找出最適合的課程</ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/glyph-neue/64/5d7262/teacher.png"
                alt="teacher"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>自選上課老師</ReasonTitle>
                <ReasonText>✔ 介紹 ✔ 履歷 ✔ 評價，三大方向自選老師</ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-sbts2018-solid-sbts2018/100/5d7262/external-partner-basic-ui-elements-2.2-sbts2018-solid-sbts2018.png"
                alt="partner"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>熊熊好夥伴們</ReasonTitle>
                <ReasonText>有 Bear 和其他同學的陪伴，練習起來更有動力</ReasonText>
              </ReasonContent>
            </Reason>
          </Reasons>
          <Title>推薦課程</Title>
          <Swiper
            slidesPerView="auto"
            spaceBetween={0}
            slidesPerGroup={1}
            loop
            loopFillGroupWithBlank
            pagination={{
              clickable: true,
            }}
            navigation
            modules={[Pagination, Navigation]}
            className="mySwiper"
            breakpoints={{
              888: {
                width: 888,
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 50,
              },
              1280: {
                width: 1280,
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 200,
              },
            }}
          >
            {coursesList?.map((course) => (
              <SwiperSlide key={course.id}>
                <Course
                  onClick={() => {
                    router.push(`/videoCourses/courseDetail/${course.id}`);
                  }}
                >
                  <CoverWrapper>
                    <Image src={course.cover} alt="cover" fill sizes="contain" />
                  </CoverWrapper>
                  <Info>{course.name}</Info>
                  <Info>NT${course.price}</Info>
                </Course>
              </SwiperSlide>
            ))}
          </Swiper>
          <Title>六個開始練瑜伽的動機</Title>
          <Reasons>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-88.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>增加身體的活動力</ReasonTitle>
                <ReasonText>
                  透過緩解腰痠背痛、增強腿部循環的瑜伽練習，消除平日因久坐久站所產生的疲勞，就能讓活力湧現
                </ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-52.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>訓練動作間的流暢感</ReasonTitle>
                <ReasonText>
                  瑜伽練習如同生活，動作與動作之間的轉換可能充滿不確定性的。瑜伽讓我們在面對日常事件的轉變時，有更多不同的方法去調整
                </ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-42.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>練習思緒不亂跑的節奏感</ReasonTitle>
                <ReasonText>
                  瑜伽練習能增進自我接受與內在和平，透過靜坐、呼吸法或體位法得到啟發。你的情緒將變得穩定正向、腳步也更輕盈了。
                </ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-64.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>提升身心合一的專注力</ReasonTitle>
                <ReasonText>
                  忙忙碌碌、持續和時間賽跑的日子，即便回到家也總是難以鬆懈，過度的勞累導致身心緊繃、輾轉難眠，就借助瑜伽練習，切換到另一個和緩的節奏上吧！
                </ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-8.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>改善緊繃痠痛的柔軟度</ReasonTitle>
                <ReasonText>
                  透過動態拉伸與靜態力量的保持，我們將能打開身體，減輕疼痛和緊張感，同時能達到更好的運動表現，無論你平常喜歡哪種運動，瑜伽都能帶來益處。
                </ReasonText>
              </ReasonContent>
            </Reason>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-66.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>打造緊實體態的核心力</ReasonTitle>
                <ReasonText>
                  打造穩固的核心，除了可以得到外在線條緊實的美好外，更能充分改善身體協調性與平衡，讓身體成為健康和自信的工具，讓你對自己的身份感到完全滿足。
                </ReasonText>
              </ReasonContent>
            </Reason>
          </Reasons>
          <Title>推薦老師</Title>
          <Swiper
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={0}
            loop
            loopFillGroupWithBlank
            pagination={{
              clickable: true,
            }}
            navigation
            modules={[Pagination, Navigation]}
            className="mySwiper"
            breakpoints={{
              600: {
                width: 600,
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 80,
              },
              700: {
                width: 700,
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 80,
              },
              850: {
                width: 850,
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 80,
              },
              1000: {
                width: 1000,
                slidesPerView: 5,
                slidesPerGroup: 5,
                spaceBetween: 80,
              },
              1280: {
                width: 1280,
                slidesPerView: 5,
                slidesPerGroup: 5,
                spaceBetween: 180,
              },
            }}
          >
            {teachersList?.map((teacher) => (
              <SwiperSlide key={teacher.id}>
                <Course
                  onClick={() => {
                    router.push(`/findTeachers/reserve/${teacher.id}`);
                  }}
                >
                  <AvatarWrapper>
                    <Image src={teacher.avatar} alt="avatar" fill sizes="contain" />
                  </AvatarWrapper>
                  <Info>{teacher.name}</Info>
                </Course>
              </SwiperSlide>
            ))}
          </Swiper>
          <Title>歡迎加入我們</Title>
          <BearWrapper>
            <Image src={Bear} alt="bear" width={500} />
          </BearWrapper>
        </Container>
      </Wrapper>
    </>
  );
}

export const getStaticProps = async () => {
  const coursesRef = collection(db, "video_courses");
  const queryCourses = await getDocs(query(coursesRef, where("price", "<", 2000), limit(9)));
  const coursesList: CoursesListInterface[] = [];
  queryCourses.forEach((data) => {
    const { id, cover, name, price } = data.data();
    coursesList.push({ id, cover, name, price });
  });

  const usersRef = collection(db, "users");
  const queryTeachers = await getDocs(query(usersRef, where("identity", "==", "teacher"), limit(15)));
  const teachersList: TeachersListInterface[] = [];
  queryTeachers.forEach((data) => {
    const { uid: id, photoURL: avatar, username: name } = data.data();
    teachersList.push({ id, avatar, name });
  });

  return {
    props: {
      coursesList,
      teachersList,
    },
    revalidate: 1800,
  };
};
