import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { getLaunchedVideoCourses } from "../../utils/firestore";
import { averageScore } from "../../utils/compute";
import HalfStar from "../../../public/star-half.png";
import Star from "../../../public/star.png";

const CoursesList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-column-gap: calc((1024px - 900px) / 2);
  grid-row-gap: 20px;
  width: 80%;
  @media screen and (max-width: 1280px) {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 0 auto;
  }
  @media screen and (max-width: 888px) {
    justify-content: center;
  }
`;
const Course = styled.li`
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  border: 1px solid lightgrey;
  box-shadow: 0 0 5px #00000050;
  border-radius: 5px;
  @media screen and (max-width: 1280px) {
    flex-basis: 45%;
  }
  @media screen and (max-width: 888px) {
    flex-basis: 80%;
  }
`;
const CourseCover = styled.div`
  position: relative;
  width: 300px;
  height: 180px;
  margin-bottom: 10px;
  @media screen and (max-width: 1280px) {
    width: 100%;
    height: 210px;
  }
  @media screen and (max-width: 888px) {
    height: 240px;
  }
  @media screen and (max-width: 540px) {
    height: 200px;
  }
  @media screen and (max-width: 450px) {
    height: 150px;
  }
`;
const CourseInfos = styled.div`
  position: relative;
  width: 100%;
  margin-left: 10px;
`;
const CourseTitle = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;
const CourseScore = styled.div`
  display: flex;
`;
const CourseReviewsInfo = styled.p`
  height: 26px;
  margin-bottom: 10px;
`;

const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
`;
const CourseStarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

interface CourseInterface {
  name: string;
  id: string;
  cover: string;
  reviews: { userId: string; score: number; comments: string }[];
}
function LaunchedVideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<CourseInterface[]>();

  useEffect(() => {
    const getTeacherLaunchedVideoCourses = async () => {
      if (!uid) return;
      const launchedVideoCourses = await getLaunchedVideoCourses(uid);
      setCourses(launchedVideoCourses);
    };
    getTeacherLaunchedVideoCourses();
  }, [uid]);

  if (courses?.length === 0) {
    return <p>目前沒有課程唷！</p>;
  }
  return (
    <CoursesList>
      {courses?.map((course) => (
        <Course key={course.name}>
          <CourseCover>
            <Link href={`/myCourses/classRoom/videoCourseRoom/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="cover" />
            </Link>
          </CourseCover>
          <CourseInfos>
            <CourseTitle>{course.name}</CourseTitle>
            {course?.reviews?.length > 0 ? (
              <CourseScore>
                <StarIcons>
                  {Array.from(
                    {
                      length: Math.floor(averageScore(course.reviews)),
                    },
                    (v, i) => i + 1
                  ).map((starIndex) => (
                    <CourseStarWrapper key={starIndex}>
                      <Image src={Star} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  ))}
                  {averageScore(course.reviews) % 1 !== 0 && (
                    <CourseStarWrapper>
                      <Image src={HalfStar} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  )}
                </StarIcons>
                <CourseReviewsInfo>
                  {(averageScore(course.reviews) || 0).toFixed(1)}分 ，{course?.reviews?.length || 0}則評論
                </CourseReviewsInfo>
              </CourseScore>
            ) : (
              <CourseReviewsInfo>目前無評價</CourseReviewsInfo>
            )}
          </CourseInfos>
        </Course>
      ))}
    </CoursesList>
  );
}
export default LaunchedVideoCourses;
