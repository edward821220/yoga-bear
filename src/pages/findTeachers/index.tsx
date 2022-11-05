import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import BearAvatar from "../../../public/member.png";

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  min-height: 77vh;
  padding: 20px 0;
  display: flex;
  align-items: center;
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
  border: 1px solid gray;
`;
const TeacherAvatar = styled.div`
  margin-right: 30px;
`;
const TeacherInfo = styled.div`
  font-size: 24px;
  width: 200px;
`;

function FindTeachers() {
  const [teachersList, setTeachersList] = useState<{ name: string; uid: string }[]>([]);
  useEffect(() => {
    const getTeachersList = async () => {
      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("role", "==", "teacher"));
      const querySnapshot = await getDocs(teachersQuery);
      const results: { name: string; uid: string }[] = [];
      querySnapshot.forEach((data) => {
        results.push({
          uid: data.data().uid,
          name: data.data().name,
        });
      });
      setTeachersList(results);
    };
    getTeachersList();
  });
  return (
    <Wrapper>
      <TeachersList>
        {teachersList.map((teacher) => (
          <Teacher key={teacher.uid}>
            <TeacherAvatar>
              <Link href={`/findTeachers/reserve/${teacher.uid}`}>
                <Image src={BearAvatar} alt="avatar" width={100} />
              </Link>
            </TeacherAvatar>
            <TeacherInfo>{teacher.name}</TeacherInfo>
          </Teacher>
        ))}
      </TeachersList>
    </Wrapper>
  );
}

export default FindTeachers;
