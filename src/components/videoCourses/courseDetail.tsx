import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import parse from "html-react-parser";
import { SetterOrUpdater } from "recoil";
import Avatar from "../../../public/member.png";
import Star from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const SubTitle = styled.h3`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  @media screen and (max-width: 555px) {
    font-size: 20px;
  }
`;
const CourseDetailContainer = styled.div`
  color: ${(props) => props.theme.colors.color2};
  max-width: 800px;
  margin: 0 auto;
  @media screen and (max-width: 866px) {
    max-width: 96%;
  }
`;
const Introduction = styled.div`
  color: ${(props) => props.theme.colors.color7};
  font-size: 18px;
  line-height: 36px;
  margin-bottom: 50px;
  @media screen and (max-width: 866px) {
    font-size: 16px;
  }
`;
const About = styled.div`
  display: flex;
`;
const TeacherInfo = styled.div`
  color: ${(props) => props.theme.colors.color7};
  margin-right: 10px;
  cursor: pointer;
`;
const TeacherWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
  overflow: hidden;
  @media screen and (max-width: 866px) {
    width: 40px;
    height: 40px;
  }
`;
const TeacherName = styled.p`
  text-align: center;
`;
const Reviews = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ScoreContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;
const Average = styled.h5`
  font-size: 66px;
  font-weight: bold;
  margin-right: 30px;
`;
const ReviewsInfo = styled.div`
  padding: 10px;
`;
const StarIcons = styled.div`
  display: flex;
  margin-bottom: 10px;
`;
const ReviewQty = styled.p`
  font-size: 20px;
`;
const Review = styled.li`
  display: flex;
  background-color: ${(props) => props.theme.colors.color8};
  border-radius: 5px;
  width: 100%;
  height: 150px;
  padding: 24px;
  margin-bottom: 20px;
`;
const User = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 80px;
  @media screen and (max-width: 866px) {
    margin-right: 50px;
  }
`;
const AvatarWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
`;
const UserName = styled.p`
  text-align: center;
`;
const CommentWrapper = styled.div`
  max-width: 80%;
`;
const Score = styled.div`
  margin-bottom: 10px;
  display: flex;
  margin-bottom: 20px;
`;
const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;
const Comments = styled.p`
  font-size: 18px;
  word-wrap: break-word;
  @media screen and (max-width: 866px) {
    font-size: 16px;
  }
`;
interface ChapterInterface {
  id: number;
  title: string;
  units: { id: number; title: string; video: string }[];
}
interface ReviewInterface {
  comments: string;
  score: number;
  userId: string;
}
interface CourseDataInterface {
  id: string;
  name: string;
  chapters: ChapterInterface[];
  introduction: string;
  introductionVideo: string;
  teacherId: string;
  cover: string;
  price: string;
  reviews: ReviewInterface[];
}

interface CourseDetailProps {
  isLogin?: boolean;
  setShowMemberModal?: SetterOrUpdater<boolean>;
  courseData: CourseDataInterface;
  teacherData: Record<string, string>;
  reviewsUsersData: { index: number; username: string; avatar: string }[];
}
function CourseDetail({ isLogin, setShowMemberModal, courseData, teacherData, reviewsUsersData }: CourseDetailProps) {
  const router = useRouter();

  return (
    <CourseDetailContainer>
      <SubTitle>課程特色</SubTitle>
      <Introduction className="ql-editor">{parse(courseData.introduction)}</Introduction>
      <SubTitle>關於老師</SubTitle>
      <About>
        <TeacherInfo
          onClick={() => {
            if (!isLogin) {
              Swal.fire({ title: "請先登入才能預約老師唷！", confirmButtonColor: "#5d7262", icon: "warning" });
              if (setShowMemberModal) setShowMemberModal(true);
              return;
            }
            router.push(`/findTeachers/reserve/${courseData.teacherId}`);
          }}
        >
          <TeacherWrapper>
            <Image src={teacherData.teacherAvatar} alt="avatar" fill sizes="contain" style={{ objectFit: "cover" }} />
          </TeacherWrapper>
          <TeacherName>{teacherData.teacherName}</TeacherName>
        </TeacherInfo>
        <Introduction className="ql-editor">{parse(teacherData.teacherExperience)}</Introduction>
      </About>
      <SubTitle>課程評價</SubTitle>
      <ScoreContainer>
        <Average>
          {(courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length || 0).toFixed(1) ||
            0}
        </Average>
        <ReviewsInfo>
          <StarIcons>
            {Array.from(
              {
                length: Math.floor(
                  courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length
                ),
              },
              (v, i) => i + 1
            ).map((starIndex) => (
              <StarWrapper key={starIndex}>
                <Image src={Star} alt="star" fill sizes="contain" />
              </StarWrapper>
            ))}
            {(courseData.reviews.reduce((acc, cur) => acc + cur.score, 0) / courseData.reviews.length) % 1 !== 0 && (
              <StarWrapper>
                <Image src={HalfStar} alt="star" fill sizes="contain" />
              </StarWrapper>
            )}
          </StarIcons>
          <ReviewQty>{courseData.reviews.length} 則評價</ReviewQty>
        </ReviewsInfo>
      </ScoreContainer>
      <Reviews>
        {courseData &&
          courseData?.reviews?.map((review, reviewIndex) => (
            <Review key={review.userId}>
              <User>
                <AvatarWrapper>
                  <Image
                    src={
                      reviewsUsersData.find((reviewUserData) => reviewUserData.index === reviewIndex)?.avatar || Avatar
                    }
                    alt="avatar"
                    fill
                    sizes="contain"
                    style={{ objectFit: "cover" }}
                  />
                </AvatarWrapper>
                <UserName>
                  {reviewsUsersData.find((reviewUserData) => reviewUserData.index === reviewIndex)?.username}
                </UserName>
              </User>
              <CommentWrapper>
                <Score>
                  {Array.from(
                    {
                      length: review.score,
                    },
                    (v, i) => i + 1
                  ).map((starIndex) => (
                    <StarWrapper key={starIndex}>
                      <Image src={Star} alt="star" fill sizes="contain" />
                    </StarWrapper>
                  ))}
                </Score>
                <Comments>{review.comments}</Comments>
              </CommentWrapper>
            </Review>
          ))}
      </Reviews>
    </CourseDetailContainer>
  );
}

CourseDetail.defaultProps = {
  isLogin: true,
  setShowMemberModal: false,
};

export default CourseDetail;
