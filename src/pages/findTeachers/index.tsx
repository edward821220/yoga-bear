import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import BearAvatar from "../../../public/member.png";
import StarIcon from "../../../public/star.png";

const Wrapper = styled.div`
  background-color: #dfb098;
  min-height: calc(100vh - 182px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  padding: 5px;
  background-color: #ffffff;
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
const TeacherName = styled.p``;
const TeacherIntroduction = styled.p``;

const TeacherScore = styled.div`
  display: flex;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

function FindTeachers() {
  const [teachersList, setTeachersList] = useState<{ name: string; uid: string }[]>([]);
  useEffect(() => {
    const getTeachersList = async () => {
      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("identity", "==", "teacher"));
      const querySnapshot = await getDocs(teachersQuery);
      const results: { name: string; uid: string }[] = [];
      querySnapshot.forEach((data) => {
        results.push({
          uid: data.data().uid,
          name: data.data().username,
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
                  <Image src={BearAvatar} alt="avatar" width={100} />
                </Link>
              </TeacherAvatar>
              <TeacherInfo>
                <TeacherName>{teacher.name}</TeacherName>
                <TeacherIntroduction>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quae placeat quibusdam veniam laudantium.
                </TeacherIntroduction>
                <TeacherScore>
                  <StarWrapper>
                    <Image src={StarIcon} alt="star" fill sizes="contain" />
                  </StarWrapper>
                  <StarWrapper>
                    <Image src={StarIcon} alt="star" fill sizes="contain" />
                  </StarWrapper>
                  <StarWrapper>
                    <Image src={StarIcon} alt="star" fill sizes="contain" />
                  </StarWrapper>
                  <StarWrapper>
                    <Image src={StarIcon} alt="star" fill sizes="contain" />
                  </StarWrapper>
                  <StarWrapper>
                    <Image src={StarIcon} alt="star" fill sizes="contain" />
                  </StarWrapper>
                  <p>4.5分 ， 5 則評論</p>
                </TeacherScore>
              </TeacherInfo>
            </Teacher>
          ))}
        </TeachersList>
      </Container>
    </Wrapper>
  );
}

export default FindTeachers;
