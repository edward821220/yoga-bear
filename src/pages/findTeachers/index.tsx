import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import produce from "immer";
import { db } from "../../../lib/firebase";
import BearAvatar from "../../../public/member.png";
import StarIcon from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const Bar = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const BarSection = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const BarTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
  color: ${(props) => props.theme.colors.color2};
`;
const BarLink = styled.li<{ selectSort: boolean }>`
  font-size: 16px;
  text-align: center;
  color: ${(props) => (props.selectSort ? props.theme.colors.color3 : props.theme.colors.color2)};
  transition: 0.2s color linear;
  margin-right: 20px;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.colors.color3};
  }
`;
const TeachersList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  width: 60%;
`;
const Teacher = styled.li`
  flex-basis: 100%;
  display: flex;
  border: 1px solid lightgray;
  border-radius: 5px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: ${(props) => props.theme.colors.color1};
  box-shadow: 0 0 5px #00000050;
  &:last-child {
    margin-bottom: 0;
  }
`;
const TeacherAvatar = styled.div`
  margin-right: 30px;
  flex-basis: 15%;
`;
const TeacherInfo = styled.div`
  font-size: 16px;
  flex-basis: 85%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${(props) => props.theme.colors.color7};
`;
const TeacherName = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.color2};
`;
const TeacherIntroduction = styled.p<{ showMore: string | number }>`
  margin-bottom: 10px;
  margin-right: 30px;
  height: ${(props) => (props.showMore ? "auto" : "97.8px")};
  overflow: hidden;
  p {
    line-height: 24px;
  }
`;

const TeacherScore = styled.div`
  display: flex;
`;
const TeacherReviewsInfo = styled.p``;
const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
`;
const Button = styled.button`
  display: block;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  min-width: 80px;
  height: 40px;
  padding: 5px 10px;
  margin-bottom: 10px;
  cursor: pointer;
`;
const ShowMoreButton = styled.div`
  font-weight: bold;
  color: ${(props) => props.theme.colors.color6};
  margin-bottom: 10px;
  margin-right: 50px;
  text-align: right;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.colors.color2};
  }
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
  introduction: string;
  exprience: string;
  beTeacherTime: number;
}

function FindTeachers() {
  const router = useRouter();
  const [teachersList, setTeachersList] = useState<TeacherInterface[]>([]);
  const [showMore, setShowMore] = useState<number>();
  const [selectSort, setSelectSort] = useState("comment");

  useEffect(() => {
    const getTeachersList = async () => {
      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("identity", "==", "teacher"));
      const querySnapshot = await getDocs(teachersQuery);
      const results: {
        name: string;
        uid: string;
        reviews: { score: number }[];
        avatar: string;
        introduction: string;
        exprience: string;
        beTeacherTime: number;
      }[] = [];
      querySnapshot.forEach((data) => {
        results.push({
          uid: data.data().uid,
          name: data.data().username,
          reviews: data.data().reviews,
          avatar: data.data().photoURL,
          introduction: data.data().teacher_introduction,
          exprience: data.data().teacher_exprience,
          beTeacherTime: data.data().beTeacherTime,
        });
      });
      setTeachersList(
        results.sort((a, b) => {
          const reviewsQtyA = a?.reviews?.length || 0;
          const reviewsQtyB = b?.reviews?.length || 0;
          if (reviewsQtyA < reviewsQtyB) {
            return 1;
          }
          if (reviewsQtyA > reviewsQtyB) {
            return -1;
          }
          return 0;
        })
      );
    };
    getTeachersList();
  }, []);

  const handleSort = (sort: string) => {
    if (sort === "comment") {
      setTeachersList(
        produce((draft) =>
          draft.sort((a, b) => {
            const reviewsQtyA = a?.reviews?.length || 0;
            const reviewsQtyB = b?.reviews?.length || 0;
            if (reviewsQtyA < reviewsQtyB) {
              return 1;
            }
            if (reviewsQtyA > reviewsQtyB) {
              return -1;
            }
            return 0;
          })
        )
      );
      setSelectSort(sort);
    } else if (sort === "score") {
      setTeachersList(
        produce((draft) =>
          draft.sort((a, b) => {
            const scoreA =
              a?.reviews?.length > 0 ? a.reviews.reduce((acc, cur) => acc + cur.score, 0) / a.reviews.length : 0;
            const scoreB =
              b?.reviews?.length > 0 ? b.reviews.reduce((acc, cur) => acc + cur.score, 0) / b.reviews.length : 0;
            if (scoreA < scoreB) {
              return 1;
            }
            if (scoreA > scoreB) {
              return -1;
            }
            return 0;
          })
        )
      );
      setSelectSort(sort);
    } else if (sort === "new") {
      setTeachersList(
        produce((draft) =>
          draft.sort((a, b) => {
            const beTeacherTimeA = a.beTeacherTime || 0;
            const beTeacherTimeB = b.beTeacherTime || 0;
            if (beTeacherTimeA < beTeacherTimeB) {
              return 1;
            }
            if (beTeacherTimeA > beTeacherTimeB) {
              return -1;
            }
            return 0;
          })
        )
      );
      setSelectSort(sort);
    }
  };

  return (
    <Wrapper>
      <Container>
        <Bar>
          <BarSection>
            <BarTitle>目前排序</BarTitle>
            <BarLink
              selectSort={selectSort === "comment"}
              onClick={() => {
                handleSort("comment");
              }}
            >
              評論多優先
            </BarLink>
            <BarLink
              selectSort={selectSort === "score"}
              onClick={() => {
                handleSort("score");
              }}
            >
              評價高優先
            </BarLink>
            <BarLink
              selectSort={selectSort === "new"}
              onClick={() => {
                handleSort("new");
              }}
            >
              新老師優先
            </BarLink>
          </BarSection>
        </Bar>
        <TeachersList>
          {teachersList.map((teacher, index) => (
            <Teacher key={teacher.uid}>
              <TeacherAvatar>
                <Link href={`/findTeachers/reserve/${teacher.uid}`}>
                  <Image src={teacher.avatar || BearAvatar} alt="avatar" width={100} height={100} />
                </Link>
              </TeacherAvatar>
              <TeacherInfo>
                <TeacherName>{teacher.name}</TeacherName>
                <TeacherIntroduction
                  showMore={showMore === index ? showMore : ""}
                  dangerouslySetInnerHTML={{
                    __html: `${teacher.introduction}<p style='margin:10px 0; color:#654116'>老師經歷</p>${teacher.exprience}`,
                  }}
                />
                <ShowMoreButton
                  onClick={() => {
                    setShowMore(index);
                  }}
                >
                  Show more
                </ShowMoreButton>
                {teacher?.reviews?.length > 0 ? (
                  <TeacherScore>
                    <StarIcons>
                      {Array.from(
                        {
                          length: Math.floor(
                            teacher.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacher.reviews.length
                          ),
                        },
                        (v, i) => i + 1
                      ).map((starIndex) => (
                        <StarWrapper key={starIndex}>
                          <Image src={StarIcon} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      ))}
                      {(teacher.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacher.reviews.length) % 1 !==
                        0 && (
                        <StarWrapper>
                          <Image src={HalfStar} alt="star" fill sizes="contain" />
                        </StarWrapper>
                      )}
                    </StarIcons>
                    <TeacherReviewsInfo>
                      {(teacher.reviews.reduce((acc, cur) => acc + cur.score, 0) / teacher.reviews.length || 0).toFixed(
                        1
                      ) || 0}
                      分 ，{teacher?.reviews?.length || 0}則評論
                    </TeacherReviewsInfo>
                  </TeacherScore>
                ) : (
                  <TeacherReviewsInfo>目前無評價</TeacherReviewsInfo>
                )}
              </TeacherInfo>
              <Button
                onClick={() => {
                  router.push(`/findTeachers/reserve/${teacher.uid}`);
                }}
              >
                立刻預約
              </Button>
            </Teacher>
          ))}
        </TeachersList>
      </Container>
    </Wrapper>
  );
}

export default FindTeachers;
