import React from "react";
import Link from "next/link";
import styled from "styled-components";

const FooterLinks = styled.ul`
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: #f2deba;
  border-top: 6px solid #5d7262;
`;
const FooterLink = styled.li`
  padding: 10px;
  border-radius: 5px;
  a {
    color: #000000;
  }
`;

function Footer() {
  return (
    <FooterLinks>
      <FooterLink>
        <Link href="/">關於Yoga Bear</Link>
      </FooterLink>
      <FooterLink>
        <Link href="/">常見問題</Link>
      </FooterLink>
      <FooterLink>
        <Link href="/">聯絡我們</Link>
      </FooterLink>
      <FooterLink>
        <Link href="/">加入我們</Link>
      </FooterLink>
      <FooterLink>
        <Link href="/">成為老師</Link>
      </FooterLink>
    </FooterLinks>
  );
}

export default Footer;
