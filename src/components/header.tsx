import React from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import BearLogo from "../../public/bear-logo2.png";

const Wrapper = styled.header`
  display: flex;
  align-items: center;
`;
const HeaderLinks = styled.ul`
  display: flex;
`;
const HeaderLink = styled.li`
  margin-right: 20px;
`;

function Header() {
  return (
    <Wrapper>
      <Image src={BearLogo} alt="logo" width={200} />
      <HeaderLinks>
        <HeaderLink>
          <Link href="myCourses">My Courses</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="classRoom">Class Room</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="member">Member</Link>
        </HeaderLink>
      </HeaderLinks>
    </Wrapper>
  );
}

export default Header;
