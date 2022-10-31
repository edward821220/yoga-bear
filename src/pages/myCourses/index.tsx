import React from "react";
import Link from "next/link";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  height: 60vh;
  padding: 20px 0;
`;
const SideBar = styled.div`
  width: 20%;
  text-align: center;
`;
const SideBarSection = styled.ul`
  margin-bottom: 50px;
`;
const SideBarTitle = styled.h3`
  font-size: 24px;
`;
const SideBarLink = styled.li`
  font-size: 16px;
`;
const Main = styled.div`
  width: 80%;
`;
const MainTitle = styled.h2`
  font-size: 36px;
  text-align: center;
`;

function myCourses() {
  return (
    <Wrapper>
      <SideBar>
        <SideBarSection>
          <SideBarTitle>學生專區</SideBarTitle>
          <SideBarLink>
            <Link href="/myCourses/classRoom/studentRoom/01">視訊課教室</Link>
          </SideBarLink>
        </SideBarSection>
        <SideBarSection>
          <SideBarTitle>老師專區</SideBarTitle>
          <SideBarLink>
            <Link href="/myCourses/classRoom/teacherRoom/01">視訊課教室</Link>
          </SideBarLink>
        </SideBarSection>
      </SideBar>
      <Main>
        <MainTitle>myCourse</MainTitle>
      </Main>
    </Wrapper>
  );
}

export default myCourses;
