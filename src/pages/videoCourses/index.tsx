import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import StarIcon from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  padding-top: 20px;
`;
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
const CoursesList = styled.ul`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 80%;
`;
const Course = styled.li`
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  margin-right: 20px;
  margin-bottom: 20px;
  &:nth-child(3n) {
    margin-right: 0;
  }
`;
const CourseCover = styled.div`
  position: relative;
  width: 300px;
  height: 180px;
  margin-bottom: 10px;
`;
const CourseInfos = styled.div`
  width: 100%;
  margin-left: 10px;
`;
const CourseInfo = styled.p`
  font-size: 18px;
  margin-bottom: 10px;
`;
const CourseScore = styled.div`
  display: flex;
  margin-bottom: 10px;
`;
const CourseReviewsInfo = styled.p``;

const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

interface CourseInterface {
  name: string;
  id: string;
  price: string;
  cover: string;
  reviews: { score: number; comments: string }[];
}

function VideoCourses() {
  const [coursesList, setCoursesList] = useState<CourseInterface[]>([]);
  useEffect(() => {
    const getCoursesList = async () => {
      const videoCoursesRef = collection(db, "video_courses");
      const querySnapshot = await getDocs(videoCoursesRef);
      const results: {
        name: string;
        id: string;
        price: string;
        cover: string;
        reviews: { score: number; comments: string }[];
      }[] = [];
      querySnapshot.forEach((data) => {
        results.push({
          id: data.data().id,
          name: data.data().name,
          price: data.data().price,
          cover: data.data().cover,
          reviews: data.data().reviews,
        });
      });
      setCoursesList(results);
    };
    getCoursesList();
  }, []);

  return (
    <Wrapper>
      <Container>
        <CoursesList>
          {coursesList.map((course) => (
            <Course key={course.id}>
              <CourseCover>
                <Link href={`/videoCourses/courseDetail/${course.id}`}>
                  <Image src={course.cover} alt="cover" fill />
                </Link>
              </CourseCover>
              <CourseInfos>
                <CourseInfo>{course.name}</CourseInfo>
                <CourseInfo>NT. {course.price}</CourseInfo>
                {course?.reviews?.length > 0 ? (
                  <CourseScore>
                    <StarIcons>
                      {/* eslint-disable no-unsafe-optional-chaining */}
                      {Array.from(
                        {
                          length: Math.floor(
                            course?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / course?.reviews?.length
                          ),
                        },
                        (v, i) => i + 1
                      ).map((starIndex) => (
                        <StarWrapper key={starIndex}>
                          <Image src={StarIcon} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      ))}
                      {(course?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / course?.reviews?.length) % 1 !==
                        0 && (
                        <StarWrapper>
                          <Image src={HalfStar} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      )}
                    </StarIcons>
                    <CourseReviewsInfo>
                      {(
                        course?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / course?.reviews?.length || 0
                      ).toFixed(1) || 0}
                      分 ，{course?.reviews?.length || 0}則評論
                    </CourseReviewsInfo>
                  </CourseScore>
                ) : (
                  <CourseReviewsInfo>目前無評價</CourseReviewsInfo>
                )}
              </CourseInfos>
            </Course>
          ))}
        </CoursesList>
      </Container>
    </Wrapper>
  );
}

export default VideoCourses;
