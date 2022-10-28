import React from "react";
import Link from "next/link";
import styled from "styled-components";

const FooterLinks = styled.ul`
  display: flex;
  justify-content: space-around;
`;
const FooterLink = styled.li``;

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
