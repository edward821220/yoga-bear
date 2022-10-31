import React from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import BearLogo from "../../public/bear-logo2.png";
import CartLogo from "../../public/cart.png";
import MemberLogo from "../../public/member.png";

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2px solid gray;
  margin-bottom: 36px;
  position: sticky;
  top: 0;
`;
const LogoWrapper = styled.div`
  margin-right: 100px;
  width: 360px;
`;
const HeaderLinks = styled.ul`
  display: flex;
  align-items: center;
  margin-right: auto;
`;
const HeaderLink = styled.li`
  margin-right: 36px;
  font-size: 24px;
  line-height: 40px;
`;
const Member = styled.ul`
  display: flex;
  align-items: center;
`;
const IconWrapper = styled.li`
  margin-right: 36px;
  width: 45px;
`;

function Header() {
  return (
    <Wrapper>
      <LogoWrapper>
        <Link href="/">
          <Image src={BearLogo} alt="logo" />
        </Link>
      </LogoWrapper>
      <HeaderLinks>
        <HeaderLink>
          <Link href="/videoCourses">影音課程</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/reserve">預約上課</Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/myCourses">我的課程</Link>
        </HeaderLink>
      </HeaderLinks>
      <Member>
        <IconWrapper>
          <Link href="/cart">
            <Image src={CartLogo} alt="cart" />
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="/member">
            <Image src={MemberLogo} alt="member" />
          </Link>
        </IconWrapper>
      </Member>
    </Wrapper>
  );
}

export default Header;
