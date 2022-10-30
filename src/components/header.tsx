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
`;
const Logo = styled.div`
  margin-right: 100px;
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

function Header() {
  return (
    <Wrapper>
      <Logo>
        <Link href="/">
          <Image src={BearLogo} alt="logo" width={360} />
        </Link>
      </Logo>
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
        <HeaderLink>
          <Link href="/cart">
            <Image src={CartLogo} alt="cart" width={40} />
          </Link>
        </HeaderLink>
        <HeaderLink>
          <Link href="/member">
            <Image src={MemberLogo} alt="member" width={40} />
          </Link>
        </HeaderLink>
      </Member>
    </Wrapper>
  );
}

export default Header;
