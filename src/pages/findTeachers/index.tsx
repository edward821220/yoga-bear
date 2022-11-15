import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import BearAvatar from "../../../public/member.png";
import StarIcon from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: #f1ead8;
  min-height: calc(100vh - 182px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const TeachersList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  width: 50%;
`;
const Teacher = styled.li`
  flex-basis: 100%;
  display: flex;
  border: 2px solid #654116;
  border-radius: 5px;
  margin-bottom: 20px;
  padding: 10px 5px;
  background-color: #fff;
  &:last-child {
    margin-bottom: 0;
  }
`;
const TeacherAvatar = styled.div`
  margin: 0 10px;
  flex-basis: 15%;
`;
const TeacherInfo = styled.div`
  font-size: 16px;
  flex-basis: 85%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #654116;
`;
const TeacherName = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;
const TeacherIntroduction = styled.p`
  margin-bottom: 10px;
`;

const TeacherScore = styled.div`
  display: flex;
`;
const TeacherReviewsInfo = styled.p``;
const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

interface TeacherInterface {
  name: string;
  uid: string;
  reviews: { score: number }[];
  avatar: string;
}

function FindTeachers() {
  const [teachersList, setTeachersList] = useState<TeacherInterface[]>([]);
  useEffect(() => {
    const getTeachersList = async () => {
      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("identity", "==", "teacher"));
      const querySnapshot = await getDocs(teachersQuery);
      const results: { name: string; uid: string; reviews: { score: number }[]; avatar: string }[] = [];
      querySnapshot.forEach((data) => {
        results.push({
          uid: data.data().uid,
          name: data.data().username,
          reviews: data.data().reviews,
          avatar: data.data().photoURL,
        });
      });
      setTeachersList(results);
    };
    getTeachersList();
  }, []);
  return (
    <Wrapper>
      <Container>
        <TeachersList>
          {teachersList.map((teacher) => (
            <Teacher key={teacher.uid}>
              <TeacherAvatar>
                <Link href={`/findTeachers/reserve/${teacher.uid}`}>
                  <Image src={teacher.avatar || BearAvatar} alt="avatar" width={100} height={100} />
                </Link>
              </TeacherAvatar>
              <TeacherInfo>
                <TeacherName>{teacher.name}</TeacherName>
                <TeacherIntroduction>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quae placeat quibusdam veniam laudantium.
                </TeacherIntroduction>
                {teacher?.reviews?.length > 0 ? (
                  <TeacherScore>
                    <StarIcons>
                      {/* eslint-disable no-unsafe-optional-chaining */}
                      {Array.from(
                        {
                          length: Math.floor(
                            teacher?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / teacher?.reviews?.length
                          ),
                        },
                        (v, i) => i + 1
                      ).map((starIndex) => (
                        <StarWrapper key={starIndex}>
                          <Image src={StarIcon} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      ))}
                      {(teacher?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / teacher?.reviews?.length) % 1 !==
                        0 && (
                        <StarWrapper>
                          <Image src={HalfStar} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      )}
                    </StarIcons>
                    <TeacherReviewsInfo>
                      {(
                        teacher?.reviews?.reduce((acc, cur) => acc + cur.score, 0) / teacher?.reviews?.length || 0
                      ).toFixed(1) || 0}
                      分 ，{teacher?.reviews?.length || 0}則評論
                    </TeacherReviewsInfo>
                  </TeacherScore>
                ) : (
                  <TeacherReviewsInfo>目前無評價</TeacherReviewsInfo>
                )}
              </TeacherInfo>
            </Teacher>
          ))}
        </TeachersList>
      </Container>
    </Wrapper>
  );
}

export default FindTeachers;
