import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import Bear from "../../public/bear-logo1.png";

const Wrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 182px);
  background-color: #dfb098;
`;

export default function Home() {
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <Wrapper>
        <Image src={Bear} alt="bear" width={600} />
      </Wrapper>
    </>
  );
}
