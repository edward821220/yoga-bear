import Head from "next/head";
import styled from "styled-components";

const Title = styled.h1``;

export default function Home() {
  return (
    <>
      <Head>
        <title>Yoga Bear</title>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <Title>HomePage</Title>
    </>
  );
}
