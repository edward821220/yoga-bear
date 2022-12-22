import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import parse from "html-react-parser";
import Swal from "sweetalert2";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import produce from "immer";
import { useSetRecoilState } from "recoil";
import { AuthContext } from "../../contexts/authContext";
import { getTeachersList } from "../../utils/firestore";
import { averageScore } from "../../utils/compute";
import { showMemberModalState } from "../../utils/recoil";
import StarIcon from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
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
  @media screen and (max-width: 488px) {
    display: none;
  }
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
  width: 66%;
  min-width: 844px;
  @media screen and (max-width: 1280px) {
    min-width: 800px;
  }
  @media screen and (max-width: 888px) {
    min-width: 0%;
    width: 99%;
  }
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
  @media screen and (max-width: 588px) {
    padding: 15px;
  }
`;
const TeacherAvatar = styled.div<{ avatar: string }>`
  margin-right: 20px;
  background: url(${(props) => props.avatar});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  @media screen and (max-width: 588px) {
    width: 66px;
    min-width: 66px;
    height: 66px;
    margin-right: 10px;
  }
`;
const TeacherInfo = styled.div`
  font-size: 16px;
  flex-basis: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${(props) => props.theme.colors.color7};
  @media screen and (max-width: 588px) {
    font-size: 14px;
  }
`;
const TeacherName = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.color2};
`;
const TeacherIntroduction = styled.div<{ showMore: boolean }>`
  margin-bottom: 10px;
  margin-right: 30px;
  height: ${(props) => (props.showMore ? "auto" : "97.8px")};
  overflow: hidden;
  p {
    line-height: 24px;
    @media screen and (max-width: 588px) {
      line-height: 20px;
    }
  }
`;

const TeacherScore = styled.div`
  display: flex;
  @media screen and (max-width: 588px) {
    flex-wrap: wrap;
  }
`;
const TeacherReviewsInfo = styled.p``;
const StarIcons = styled.div`
  display: flex;
  margin-right: 10px;
  @media screen and (max-width: 588px) {
    margin-bottom: 10px;
  }
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
  @media screen and (max-width: 588px) {
    min-width: 0;
    max-width: 50px;
    height: 60px;
    padding: 5px 5px;
  }
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
  @media screen and (max-width: 588px) {
    width: 16px;
    height: 16px;
  }
`;

interface TeacherInterface {
  name: string;
  uid: string;
  reviews: { score: number }[];
  avatar: string;
  introduction: string;
  experience: string;
  beTeacherTime: number;
}

function FindTeachers({ results }: { results: TeacherInterface[] }) {
  const router = useRouter();
  const { keywords } = router.query;
  const { isLogin } = useContext(AuthContext);
  const setShowMemberModal = useSetRecoilState(showMemberModalState);
  const [teachersList, setTeachersList] = useState(results);
  const [showMore, setShowMore] = useState<string>();
  const [selectSort, setSelectSort] = useState("comment");

  useEffect(() => {
    const getNewTeachersList = async () => {
      let newResults = await getTeachersList();
      if (typeof keywords === "string") {
        newResults = newResults.filter((teacher) => teacher.name.toLowerCase().includes(keywords.toLowerCase()));
      }
      setTeachersList(
        newResults.sort((a, b) => {
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
      setSelectSort("comment");
    };
    getNewTeachersList();
  }, [keywords]);

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
            const scoreA = a?.reviews?.length > 0 ? averageScore(a.reviews) : 0;
            const scoreB = b?.reviews?.length > 0 ? averageScore(b.reviews) : 0;
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
  if (results.length === 0)
    return (
      <Wrapper>
        <Container>找不到您搜尋的老師，請重新查詢唷！</Container>
      </Wrapper>
    );

  return (
    <>
      <Head>
        <title>預約老師 - Yoga Bear</title>
      </Head>
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
            {teachersList.map((teacher) => (
              <Teacher key={teacher.uid}>
                <TeacherAvatar
                  avatar={teacher.avatar}
                  onClick={() => {
                    if (!isLogin) {
                      Swal.fire({
                        title: "請先登入才能預約老師唷！",
                        confirmButtonColor: "#5d7262",
                        icon: "warning",
                      });
                      setShowMemberModal(true);
                      return;
                    }
                    router.push(`/findTeachers/reserve/${teacher.uid}`);
                  }}
                />
                <TeacherInfo>
                  <TeacherName>{teacher.name}</TeacherName>
                  <TeacherIntroduction showMore={showMore === teacher.uid}>
                    {parse(
                      `${teacher.introduction}<p style='margin:10px 0; color:#654116'>老師經歷</p>${teacher.experience}`
                    )}
                  </TeacherIntroduction>
                  <ShowMoreButton
                    onClick={() => {
                      if (showMore === teacher.uid) {
                        setShowMore("");
                      } else {
                        setShowMore(teacher.uid);
                      }
                    }}
                  >
                    Show more
                  </ShowMoreButton>
                  {teacher?.reviews?.length > 0 ? (
                    <TeacherScore>
                      <StarIcons>
                        {Array.from(
                          {
                            length: Math.floor(averageScore(teacher.reviews)),
                          },
                          (v, i) => i + 1
                        ).map((starIndex) => (
                          <StarWrapper key={starIndex}>
                            <Image src={StarIcon} alt="star" fill sizes="contain" />
                          </StarWrapper>
                        ))}
                        {averageScore(teacher.reviews) % 1 !== 0 && (
                          <StarWrapper>
                            <Image src={HalfStar} alt="star" fill sizes="contain" />
                          </StarWrapper>
                        )}
                      </StarIcons>
                      <TeacherReviewsInfo>
                        {(averageScore(teacher.reviews) || 0).toFixed(1) || 0}分 ，{teacher?.reviews?.length || 0}則評論
                      </TeacherReviewsInfo>
                    </TeacherScore>
                  ) : (
                    <TeacherReviewsInfo>目前無評價</TeacherReviewsInfo>
                  )}
                </TeacherInfo>
                <Button
                  onClick={() => {
                    if (!isLogin) {
                      Swal.fire({
                        title: "請先登入才能預約老師唷！",
                        confirmButtonColor: "#5d7262",
                        icon: "warning",
                      });
                      setShowMemberModal(true);
                      return;
                    }
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
    </>
  );
}

export default FindTeachers;

export const getServerSideProps = async ({ query }: { query: { keywords: string } }) => {
  const { keywords }: { keywords: string } = query;
  let results = await getTeachersList();

  if (keywords) {
    results = results.filter((teacher) => teacher.name.toLowerCase().includes(keywords.toLowerCase()));
  }

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
  });

  return {
    props: {
      results,
    },
  };
};
