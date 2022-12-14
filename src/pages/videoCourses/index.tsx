import { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import produce from "immer";
import { getCoursesList } from "../../utils/firestore";
import { averageScore } from "../../utils/compute";
import StarIcon from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  padding: 40px 0;
`;
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media screen and (max-width: 1280px) {
    width: 96%;
  }
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
  @media screen and (max-width: 540px) {
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
  @media screen and (max-width: 540px) {
    font-size: 15px;
    margin-right: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
`;
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
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 0 0 5px #00000050;
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
  width: 100%;
  margin-left: 10px;
`;
const CourseTitle = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;
const CourseInfo = styled.p`
  font-size: 18px;
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
const StarWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  @media screen and (max-width: 450px) {
    width: 16px;
    height: 16px;
  }
`;

interface CourseInterface {
  name: string;
  id: string;
  price: number;
  cover: string;
  reviews: { score: number; comments: string }[];
  launchTime: number;
}

function VideoCourses({ results }: { results: CourseInterface[] }) {
  const router = useRouter();
  const { keywords } = router.query;
  const [coursesList, setCoursesList] = useState(results);
  const [selectSort, setSelectSort] = useState("comment");

  useEffect(() => {
    const getNewCoursesList = async () => {
      let newResults = await getCoursesList();
      if (typeof keywords === "string") {
        newResults = newResults.filter((course) => course.name.includes(keywords));
      }
      setCoursesList(
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
    };
    getNewCoursesList();
  }, [keywords]);

  const handleSort = (sort: string) => {
    if (sort === "comment") {
      setCoursesList(
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
      setCoursesList(
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
      setCoursesList(
        produce((draft) =>
          draft.sort((a, b) => {
            const beTeacherTimeA = a.launchTime || 0;
            const beTeacherTimeB = b.launchTime || 0;
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
    } else if (sort === "price") {
      setCoursesList(
        produce((draft) =>
          draft.sort((a, b) => {
            const beTeacherTimeA = Number(a.price) || 0;
            const beTeacherTimeB = Number(b.price) || 0;
            if (beTeacherTimeA < beTeacherTimeB) {
              return -1;
            }
            if (beTeacherTimeA > beTeacherTimeB) {
              return 1;
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
        <Container>???????????????????????????????????????????????????</Container>
      </Wrapper>
    );

  return (
    <>
      <Head>
        <title>???????????? - Yoga Bear</title>
      </Head>
      <Wrapper>
        <Container>
          <Bar>
            <BarSection>
              <BarTitle>????????????</BarTitle>
              <BarLink
                selectSort={selectSort === "comment"}
                onClick={() => {
                  handleSort("comment");
                }}
              >
                ???????????????
              </BarLink>
              <BarLink
                selectSort={selectSort === "score"}
                onClick={() => {
                  handleSort("score");
                }}
              >
                ???????????????
              </BarLink>
              <BarLink
                selectSort={selectSort === "new"}
                onClick={() => {
                  handleSort("new");
                }}
              >
                ???????????????
              </BarLink>
              <BarLink
                selectSort={selectSort === "price"}
                onClick={() => {
                  handleSort("price");
                }}
              >
                ???????????????
              </BarLink>
            </BarSection>
          </Bar>
          <CoursesList>
            {coursesList.map((course) => (
              <Course key={course.id}>
                <CourseCover>
                  <Link href={`/videoCourses/courseDetail/${course.id}`}>
                    <Image src={course.cover} alt="cover" fill sizes="contain" style={{ objectFit: "cover" }} />
                  </Link>
                </CourseCover>
                <CourseInfos>
                  <CourseTitle>{course.name}</CourseTitle>
                  <CourseInfo>NT. {course.price}</CourseInfo>
                  {course?.reviews?.length > 0 ? (
                    <CourseScore>
                      <StarIcons>
                        {Array.from(
                          {
                            length: Math.floor(averageScore(course.reviews)),
                          },
                          (v, i) => i + 1
                        ).map((starIndex) => (
                          <StarWrapper key={starIndex}>
                            <Image src={StarIcon} alt="star" fill sizes="contain" />
                          </StarWrapper>
                        ))}
                        {averageScore(course.reviews) % 1 !== 0 && (
                          <StarWrapper>
                            <Image src={HalfStar} alt="star" fill sizes="contain" />
                          </StarWrapper>
                        )}
                      </StarIcons>
                      <CourseReviewsInfo>
                        {averageScore(course.reviews).toFixed(1) || 0}??? ???{course?.reviews?.length || 0}?????????
                      </CourseReviewsInfo>
                    </CourseScore>
                  ) : (
                    <CourseReviewsInfo>???????????????</CourseReviewsInfo>
                  )}
                </CourseInfos>
              </Course>
            ))}
          </CoursesList>
        </Container>
      </Wrapper>
    </>
  );
}

export default VideoCourses;

export const getServerSideProps = async ({ query }: { query: { keywords: string } }) => {
  const { keywords }: { keywords: string } = query;
  let results = await getCoursesList();
  if (keywords) {
    results = results.filter((course) => course.name.includes(keywords));
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
