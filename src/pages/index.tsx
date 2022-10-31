import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import Bear from "../../public/bear-logo1.png";

const Title = styled.h1`
  font-size: 60px;
  text-align: center;
`;
const Wrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function Home() {
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <Wrapper>
        <Title>HomePage</Title>
        <Image src={Bear} alt="bear" width={600} />
      </Wrapper>
    </>
  );
}
