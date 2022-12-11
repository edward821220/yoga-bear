import { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import produce from "immer";
import { addVideoCourseReview, getMyVideoCourses, getUserData } from "../../utils/firestore";
import Modal from "../modal";
import Star from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";
import EmptyStar from "../../../public/star-empty.png";

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
const ReviewButton = styled.button`
  position: absolute;
  right: 20px;
  top: 0;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  border: none;
  width: 60px;
  height: 18px;
  cursor: pointer;
`;

const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${(props) => props.theme.colors.color2};
`;
const ReviewLabel = styled.label`
  display: flex;
  margin-bottom: 20px;
`;
const ReviewTextarea = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
  margin-bottom: 20px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  @media screen and (max-width: 450px) {
    width: 16px;
    height: 16px;
  }
`;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border: none;
  border-radius: 5px;
  min-width: 100px;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
`;

interface CourseInterface {
  name: string;
  id: string;
  cover: string;
  reviews: { userId: string; score: number; comments: string }[];
}
function MyVideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<CourseInterface[]>();
  const [showReviewModal, setShowReviewModal] = useState<number | boolean>(false);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const getCourses = async () => {
      if (!uid) return;
      const userSnap = await getUserData(uid);
      let myVideoCoursesId: string[] = [];
      if (userSnap.exists()) {
        myVideoCoursesId = userSnap.data().boughtCourses as string[];
      }
      if (!myVideoCoursesId) {
        setCourses([]);
        return;
      }
      const results = await getMyVideoCourses(myVideoCoursesId);
      setCourses(results);
    };
    getCourses();
  }, [uid]);

  const handleClose = () => {
    setScore(0);
    setComments("");
    setShowReviewModal(false);
  };

  if (courses?.length === 0) {
    return <p>目前沒有課程唷！</p>;
  }
  return (
    <CoursesList>
      {courses?.map((course, courseIndex) => (
        <Course key={course.id}>
          <CourseCover>
            <Link href={`/myCourses/classRoom/videoCourseRoom/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="contain" style={{ objectFit: "cover" }} />
            </Link>
          </CourseCover>
          <CourseInfos>
            <CourseTitle>{course.name}</CourseTitle>
            {course?.reviews?.length > 0 ? (
              <CourseScore>
                <StarIcons>
                  {Array.from(
                    {
                      length: Math.floor(
                        course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length
                      ),
                    },
                    (v, i) => i + 1
                  ).map((starIndex) => (
                    <CourseStarWrapper key={starIndex}>
                      <Image src={Star} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  ))}
                  {(course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length) % 1 !== 0 && (
                    <CourseStarWrapper>
                      <Image src={HalfStar} alt="star" fill sizes="contain" />
                    </CourseStarWrapper>
                  )}
                </StarIcons>
                <CourseReviewsInfo>
                  {(course.reviews.reduce((acc, cur) => acc + cur.score, 0) / course.reviews.length || 0).toFixed(1) ||
                    0}
                  分 ，{course?.reviews?.length || 0}則評論
                </CourseReviewsInfo>
              </CourseScore>
            ) : (
              <CourseReviewsInfo>目前無評價</CourseReviewsInfo>
            )}
            {course?.reviews?.some((review) => review.userId === uid) || (
              <ReviewButton
                type="button"
                onClick={() => {
                  setShowReviewModal(courseIndex);
                }}
              >
                評價
              </ReviewButton>
            )}
          </CourseInfos>
          {showReviewModal === courseIndex && (
            <Modal handleClose={handleClose}>
              <ReviewForm>
                <ReviewLabel>
                  {Array.from({ length: 5 }, (v, i) => i + 1).map((starIndex) => (
                    <StarWrapper
                      key={starIndex}
                      onClick={() => {
                        setScore(starIndex);
                      }}
                    >
                      {score >= starIndex ? (
                        <Image src={Star} alt="star" fill sizes="contain" />
                      ) : (
                        <Image src={EmptyStar} alt="empty-star" fill sizes="contain" />
                      )}
                    </StarWrapper>
                  ))}
                </ReviewLabel>
                <ReviewLabel>
                  <ReviewTextarea
                    placeholder="留下您的評價"
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value);
                    }}
                  />
                </ReviewLabel>
                <Button
                  type="button"
                  onClick={async () => {
                    if (score === 0) {
                      Swal.fire({ title: "請點選星星評分", confirmButtonColor: "#5d7262", icon: "warning" });
                      return;
                    }
                    await addVideoCourseReview(course.id, {
                      userId: uid,
                      score,
                      comments,
                    });

                    Swal.fire({
                      text: "感謝您的評論～您的支持是我們最大的動力！",
                      confirmButtonColor: "#5d7262",
                      icon: "success",
                    });
                    setCourses(
                      produce((draft) => {
                        if (!draft) return;
                        draft[courseIndex].reviews?.push({
                          userId: uid,
                          score,
                          comments,
                        });
                      })
                    );
                    setComments("");
                    setScore(0);
                    setShowReviewModal(false);
                  }}
                >
                  送出
                </Button>
              </ReviewForm>
            </Modal>
          )}
        </Course>
      ))}
    </CoursesList>
  );
}

export default MyVideoCourses;
