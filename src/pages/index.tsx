import { useState, useContext } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import { AuthContext } from "../contexts/authContext";
import { getRecommended } from "../utils/firestore";
import { showMemberModalState } from "../utils/recoil";
import Bear from "../../public/bear-logo1.png";
import BannerPic from "../../public/banner6.jpg";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Wrapper = styled.div`
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
  cursor: pointer;
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
  const { isLogin } = useContext(AuthContext);
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("course");
  const setShowMemberModal = useSetRecoilState(showMemberModalState);
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
      </Head>
      <Wrapper>
        <Banner>
          <BannerImage src={BannerPic} alt="banner" />
          <SloganContainer>
            <Slogan>???????????????????????????</Slogan>
            <SubSlogan>??? Yoga Bear ????????????????????????????????????</SubSlogan>
            <SearchBox
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (category === "course") router.push(`/videoCourses?keywords=${keywords}`);
                if (category === "teacher") router.push(`/findTeachers?keywords=${keywords}`);
              }}
            >
              <SearchInput
                placeholder={category === "course" ? "?????????????????????" : "???????????????????????????"}
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
                defaultChecked
              />
              ?????????
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
              ?????????
            </SearchLabel>
          </SloganContainer>
        </Banner>
        <Container>
          <Title>???????????? Yoga Bear ?????????</Title>
          <Reasons>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/ios-filled/100/5d7262/calendar--v1.png"
                alt="calendar"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>??????????????????</ReasonTitle>
                <ReasonText>??????????????????????????????????????????????????????</ReasonText>
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
                <ReasonTitle>??????????????????</ReasonTitle>
                <ReasonText>?????????????????????????????????????????????????????????</ReasonText>
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
                <ReasonTitle>??????????????????</ReasonTitle>
                <ReasonText>??? ?????? ??? ?????? ??? ?????????????????????????????????</ReasonText>
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
                <ReasonTitle>??????????????????</ReasonTitle>
                <ReasonText>??? Bear ???????????????????????????????????????????????????</ReasonText>
              </ReasonContent>
            </Reason>
          </Reasons>
          <Title>????????????</Title>
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
          <Title>??????????????????????????????</Title>
          <Reasons>
            <Reason>
              <ReasonIcon
                src="https://img.icons8.com/external-ddara-fill-ddara/64/5d7262/external-yoga-yoga-poses-ddara-fill-ddara-88.png"
                alt="pose"
                width={50}
                height={50}
              />
              <ReasonContent>
                <ReasonTitle>????????????????????????</ReasonTitle>
                <ReasonText>
                  ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                <ReasonTitle>???????????????????????????</ReasonTitle>
                <ReasonText>
                  ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                <ReasonTitle>?????????????????????????????????</ReasonTitle>
                <ReasonText>
                  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                <ReasonTitle>??????????????????????????????</ReasonTitle>
                <ReasonText>
                  ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                <ReasonTitle>??????????????????????????????</ReasonTitle>
                <ReasonText>
                  ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                <ReasonTitle>??????????????????????????????</ReasonTitle>
                <ReasonText>
                  ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                </ReasonText>
              </ReasonContent>
            </Reason>
          </Reasons>
          <Title>????????????</Title>
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
                    if (!isLogin) {
                      Swal.fire({
                        title: "????????????????????????????????????",
                        confirmButtonColor: "#5d7262",
                        icon: "warning",
                      });
                      setShowMemberModal(true);
                      return;
                    }
                    router.push(`/findTeachers/reserve/${teacher.id}`);
                  }}
                >
                  <AvatarWrapper>
                    <Image src={teacher.avatar} alt="avatar" fill sizes="contain" style={{ objectFit: "cover" }} />
                  </AvatarWrapper>
                  <Info>{teacher.name}</Info>
                </Course>
              </SwiperSlide>
            ))}
          </Swiper>
          <Title>??????????????????</Title>
          <BearWrapper
            onClick={() => {
              setShowMemberModal(true);
            }}
          >
            <Image src={Bear} alt="bear" width={500} />
          </BearWrapper>
        </Container>
      </Wrapper>
    </>
  );
}

export const getStaticProps = async () => {
  const { coursesList, teachersList } = await getRecommended();

  return {
    props: {
      coursesList,
      teachersList,
    },
    revalidate: 1800,
  };
};
