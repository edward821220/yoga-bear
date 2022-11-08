import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  min-height: 77vh;
  padding: 20px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
const CoursesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  width: 80%;
`;
const Course = styled.li`
  border: 1px solid gray;
  margin-right: 20px;
  margin-bottom: 20px;
`;
const CourseCover = styled.div`
  position: relative;
  width: 300px;
  height: 180px;
  margin-bottom: 10px;
`;
const CourseInfos = styled.div`
  width: 200px;
  margin-left: 10px;
`;
const CourseInfo = styled.p`
  font-size: 18px;
  margin-bottom: 10px;
`;

interface CourseInterface {
  name: string;
  id: string;
  price: string;
  cover: string;
  reviews: { score: string; comment: string };
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
        reviews: { score: string; comment: string };
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
              {course.reviews.score ? (
                <CourseInfo>{course.reviews.score}</CourseInfo>
              ) : (
                <CourseInfo>目前無評價</CourseInfo>
              )}
            </CourseInfos>
          </Course>
        ))}
      </CoursesList>
    </Wrapper>
  );
}

export default VideoCourses;
