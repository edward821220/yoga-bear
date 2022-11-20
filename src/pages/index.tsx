import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Bear from "../../public/bear-logo1.png";
import BannerPic from "../../public/yoga-beach.jpeg";
import "swiper/css";

const Wrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 100px);
  background-color: ${(props) => props.theme.colors.color1};
`;
const Banner = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  max-height: 400px;
  margin-bottom: 20px;
  overflow: hidden;
`;
const BannerImage = styled(Image)`
  height: auto;
  width: 100%;
  transform: translate(0, -30%);
`;

export default function Home() {
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <Wrapper>
        <Banner>
          <BannerImage src={BannerPic} alt="banner" />
        </Banner>
        <Swiper
          spaceBetween={50}
          slidesPerView={5}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          <SwiperSlide>Slide 1</SwiperSlide>
          <SwiperSlide>Slide 2</SwiperSlide>
          <SwiperSlide>Slide 3</SwiperSlide>
          <SwiperSlide>Slide 4</SwiperSlide>
        </Swiper>
        <Image src={Bear} alt="bear" width={600} />
      </Wrapper>
    </>
  );
}
