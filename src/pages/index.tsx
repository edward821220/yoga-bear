import Head from "next/head";
import Link from "next/link";
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
      <Link href="member">Member</Link>
      <Link href="myCourse">My Courses</Link>
      <Link href="classRoom">Class Room</Link>
    </>
  );
}
