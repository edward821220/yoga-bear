import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/authContext";
import MyVideoCourses from "../../components/videoCourses/myVideoCourses";
import LaunchedVideoCourses from "../../components/videoCourses/launchedVideoCourses";
import LaunchVideoCourse from "../../components/videoCourses/launchVideoCourse";
import BeTeacher from "../../components/videoCourses/beTeacher";
import ToggleButton from "../../components/toggleButton";
import Calendar from "../../components/calendar/calendar";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  margin: 0 auto;
  max-width: 1280px;
  padding: 40px 0;
`;
const Bar = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const BarSection = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const ToggleButtonLabel = styled.label``;
const BarTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
  margin-left: 20px;
  color: ${(props) => props.theme.colors.color2};
`;
const BarLink = styled.li<{ active: boolean }>`
  font-size: 16px;
  margin-right: 20px;
  a {
    text-align: center;
    transition: 0.2s color linear;
    color: ${(props) => (props.active ? props.theme.colors.color3 : props.theme.colors.color6)};
    border: ${(props) => (props.active ? "1px solid gray" : "none")};
    padding: 2px 5px;
    &:hover {
      color: ${(props) => props.theme.colors.color3};
    }
  }
`;
const Main = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CalendarWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
  @media screen and (max-width: 1280px) {
    width: 98%;
  }
`;

const routeTitle: Record<string, string> = {
  videoCourses: "我的影音課程（學生）",
  studentCalendar: "已預約課表（學生）",
  beTeacher: "我要當老師（學生）",
  launchedVideoCourses: "已上架影音課（老師）",
  launchVideoCourse: "影音課程上架（老師）",
  teacherCalendar: "排課行事曆（老師）",
};

function MyCourses() {
  const router = useRouter();
  const { category } = router.query;
  const { userData, setUserData } = useContext(AuthContext);
  const [teacherAuthority, setTeacherAuthority] = useState(false);

  useEffect(() => {
    if (category === "launchedVideoCourses" || category === "launchVideoCourse" || category === "teacherCalendar") {
      setTeacherAuthority(true);
    }
    if (category === "videoCourses" || category === "studentCalendar" || category === "beTeacher") {
      setTeacherAuthority(false);
    }
  }, [category]);

  return (
    <>
      <Head>{typeof category === "string" && <title>{routeTitle[category]} - Yoga Bear</title>}</Head>
      <Wrapper>
        <Bar>
          {userData.identity === "teacher" && (
            <BarSection>
              <BarTitle>學生</BarTitle>
              <ToggleButtonLabel
                onChange={(e: React.FormEvent<HTMLLabelElement>) => {
                  const target = e.target as HTMLInputElement;
                  const check = target.checked;
                  setTeacherAuthority(check);
                  if (teacherAuthority === false) {
                    router.push("/myCourses/launchedVideoCourses");
                  } else {
                    router.push("/myCourses/videoCourses");
                  }
                }}
              >
                <ToggleButton state={teacherAuthority} />
              </ToggleButtonLabel>
              <BarTitle>老師</BarTitle>
            </BarSection>
          )}
          {userData.identity && !teacherAuthority && (
            <BarSection>
              <BarLink active={typeof category === "string" && category === "videoCourses"}>
                <Link href="/myCourses/videoCourses">我的影音課程</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "studentCalendar"}>
                <Link href="/myCourses/studentCalendar">已預約課表</Link>
              </BarLink>
              {userData.identity === "student" && (
                <BarLink active={typeof category === "string" && category === "beTeacher"}>
                  <Link href="/myCourses/beTeacher">我要當老師</Link>
                </BarLink>
              )}
            </BarSection>
          )}
          {userData.identity === "teacher" && teacherAuthority && (
            <BarSection>
              <BarLink active={typeof category === "string" && category === "launchedVideoCourses"}>
                <Link href="/myCourses/launchedVideoCourses">已上架影音課</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "launchVideoCourse"}>
                <Link href="/myCourses/launchVideoCourse">影音課程上架</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "teacherCalendar"}>
                <Link href="/myCourses/teacherCalendar">排課行事曆</Link>
              </BarLink>
            </BarSection>
          )}
        </Bar>
        <Main>
          {category === "videoCourses" && <MyVideoCourses uid={userData.uid} />}
          {category === "launchVideoCourse" && <LaunchVideoCourse uid={userData.uid} />}
          {category === "launchedVideoCourses" && <LaunchedVideoCourses uid={userData.uid} />}
          {category === "teacherCalendar" && (
            <CalendarWrapper>
              <Calendar userData={userData} category={category} />
            </CalendarWrapper>
          )}
          {category === "studentCalendar" && (
            <CalendarWrapper>
              <Calendar userData={userData} category={category} />
            </CalendarWrapper>
          )}
          {category === "beTeacher" && <BeTeacher uid={userData.uid} setUserData={setUserData} />}
        </Main>
      </Wrapper>
    </>
  );
}

export default MyCourses;
