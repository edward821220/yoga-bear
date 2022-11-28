import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import produce from "immer";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../contexts/authContext";
import { storage, db } from "../../../lib/firebase";
import Modal from "../../components/modal";
import Editor from "../../components/editor/editor";
import ToggleButton from "../../components/toggleButton";
import Bear from "../../../public/bear.png";
import Trash from "../../../public/trash.png";
import Upload from "../../../public/upload.png";
import TeacherCalendar from "../../components/calendar/teacherCalendar";
import StudentCalendar from "../../components/calendar/studentCalendar";
import EmptyStar from "../../../public/star-empty.png";
import Star from "../../../public/star.png";
import HalfStar from "../../../public/star-half.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
  margin: 0 auto;
  max-width: 1280px;
  padding: 40px 0;
`;
const Bar = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const BarSection = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const ToggleButtonLabel = styled.label``;
const BarTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
  margin-left: 20px;
  color: ${(props) => props.theme.colors.color2};
`;
const BarLink = styled.li<{ active: boolean }>`
  font-size: 16px;
  margin-right: 20px;
  a {
    text-align: center;
    transition: 0.2s color linear;
    color: ${(props) => (props.active ? props.theme.colors.color3 : props.theme.colors.color6)};
    border: ${(props) => (props.active ? "1px solid gray" : "none")};
    padding: 2px 5px;
    &:hover {
      color: ${(props) => props.theme.colors.color3};
    }
  }
`;
const Main = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const LaunchForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.color2};
  background-color: ${(props) => props.theme.colors.color1};
  width: 60%;
  border: 1px solid lightgrey;
  border-radius: 5px;
  box-shadow: 0 0 5px #00000050;
  padding-top: 20px;
  padding-bottom: 10px;
  margin: 0 auto;
  @media screen and (max-width: 950px) {
    min-width: 600px;
  }
  @media screen and (max-width: 628px) {
    min-width: 550px;
  }
  @media screen and (max-width: 566px) {
    min-width: 430px;
  }
  @media screen and (max-width: 422px) {
    min-width: 380px;
  }
`;
const LaunchFormLabel = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  .ql-editor {
    color: #000;
    width: 500px;
    height: 300px;
    border: 1px solid gray;
    @media screen and (max-width: 566px) {
      width: 400px;
    }
    @media screen and (max-width: 422px) {
      width: 350px;
    }
  }
`;
const LaunchFormLabelText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
`;
const LaunchFormLabelInput = styled.input`
  display: block;
  width: 500px;
  line-height: 24px;
  padding-left: 5px;
  margin-bottom: 20px;
  @media screen and (max-width: 566px) {
    width: 400px;
  }
  @media screen and (max-width: 422px) {
    width: 350px;
  }
`;

const LaunchFormLabelFile = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  cursor: pointer;
`;
const LaunchFormLabelFileButton = styled.div`
  font-size: 16px;
  text-align: center;
  color: gray;
  background-color: white;
  min-width: 100px;
  max-width: 150px;
  border: 1px solid gray;
  border-radius: 5px;
  padding: 10px;
  margin: 0 auto;
  margin-bottom: 10px;
`;
const LaunchFormLabelInputFile = styled.input`
  display: none;
  width: 500px;
  line-height: 24px;
  padding-left: 5px;
  margin-bottom: 20px;
`;
const PlusButton = styled.button`
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color2};
  border: none;
  border-radius: 5px;
  min-width: 100px;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
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

const RemoveIcon = styled(Image)`
  width: 20px;
  height: auto;
  cursor: pointer;
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
const CalendarWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
  @media screen and (max-width: 1280px) {
    width: 98%;
  }
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

interface Review {
  userId: string;
  score: number;
  comments: string;
}

interface CourseInterface {
  name: string;
  id: string;
  cover: string;
  reviews: { userId: string; score: number; comments: string }[];
}
function VideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<CourseInterface[]>();
  const [showReviewModal, setShowReviewModal] = useState<number | boolean>(false);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const getCourses = async () => {
      if (!uid) return;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      let myVideoCourses: string[] = [];
      if (docSnap.exists() && docSnap) {
        myVideoCourses = await docSnap.data().boughtCourses;
      }
      if (!myVideoCourses) {
        setCourses([]);
        return;
      }
      const results: { name: string; cover: string; id: string; reviews: Review[] }[] = [];
      await Promise.all(
        myVideoCourses.map(async (id: string) => {
          const videoDocRef = doc(db, "video_courses", id);
          const data = await getDoc(videoDocRef);
          if (data.exists() && data) {
            results.push({
              id: data.data().id,
              name: data.data().name,
              cover: data.data().cover,
              reviews: data.data().reviews,
            });
          }
        })
      );
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
              <Image src={course.cover} alt="cover" fill sizes="contain" />
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
                    const courseRef = doc(db, "video_courses", course.id);
                    await updateDoc(courseRef, {
                      reviews: arrayUnion({
                        userId: uid,
                        score,
                        comments,
                      }),
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
function LaunchedVideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<CourseInterface[]>();

  useEffect(() => {
    const getLaunchedVideoCourses = async () => {
      if (!uid) return;
      const usersRef = collection(db, "video_courses");
      const teachersQuery = query(usersRef, where("teacher_id", "==", uid));
      const querySnapshot = await getDocs(teachersQuery);
      const launchedVideoCourses = querySnapshot.docs.map((course) => {
        const { name, cover, id, reviews } = course.data();
        return { name, cover, id, reviews };
      });
      setCourses(launchedVideoCourses);
    };
    getLaunchedVideoCourses();
  }, [uid]);

  if (courses?.length === 0) {
    return <p>目前沒有課程唷！</p>;
  }
  return (
    <CoursesList>
      {courses?.map((course) => (
        <Course key={course.name}>
          <CourseCover>
            <Link href={`/myCourses/classRoom/videoCourseRoom/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="cover" />
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
          </CourseInfos>
        </Course>
      ))}
    </CoursesList>
  );
}
function UploadProgressModal({ progressBar }: { progressBar: { file: string; progress: number } }) {
  const handleClose = () => {
    Swal.fire({ text: "課程上傳中，請勿關閉視窗！", confirmButtonColor: "#5d7262", icon: "warning" });
  };
  return (
    <Modal handleClose={handleClose}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2
          style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
        >{`Uploading ${progressBar.file}`}</h2>
        <h2
          style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
        >{`Upload is ${progressBar.progress}% done`}</h2>
        <h2 style={{ textAlign: "center", fontSize: "20px", color: "#075866", marginBottom: "10px" }}>
          頭倒立為體位法之王
        </h2>
        <h2 style={{ textAlign: "center", fontSize: "20px", color: "#075866", marginBottom: "10px" }}>
          每天三分鐘，宿便、失眠不再有
        </h2>
        <Image src={Bear} alt="bear" width={300} />
      </div>
    </Modal>
  );
}
interface UnitInterface {
  id: number;
  title: string;
  filename: string;
  video: string;
}
interface ChapterInterface {
  id: number;
  title: string;
  units: UnitInterface[];
}
function LaunchVideoCourse({ uid }: { uid: string }) {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [price, setPrice] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [coursePreview, setCoursePreview] = useState("");
  const [chapters, setChapters] = useState<ChapterInterface[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [progressBar, setProgressBar] = useState<{ file: string; progress: number }>({ file: "", progress: 0 });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMemberModal(true);

    let newChapters = [...chapters];
    let imageUrl = "";
    let introductionVideoUrl = "";
    async function uploadTaskPromise(input: HTMLInputElement, index: number) {
      return new Promise((resolve, reject) => {
        if (!input.files) return;
        const file = input.files[0];
        const storageRef = ref(storage, `${courseName}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);
            setProgressBar({ file: file.name, progress: Number(progress) });
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (index === 0) {
              imageUrl = downloadUrl;
              resolve(downloadUrl);
              return;
            }
            if (index === 1) {
              introductionVideoUrl = downloadUrl;
              resolve(downloadUrl);
              return;
            }
            newChapters = produce(newChapters, (draft) => {
              const targetChapter = draft.find((_, i) => i === Number(input.dataset.chapter));
              if (!targetChapter) return;
              if (!input.dataset.unit) return;
              const unit = Number(input.dataset.unit);
              targetChapter.units[unit].video = downloadUrl;
            });
            resolve(downloadUrl);
          }
        );
      });
    }
    const fileInputs: HTMLInputElement[] = Array.from(document.querySelectorAll("input[type=file]"));
    await Promise.all(
      fileInputs.map(async (input: HTMLInputElement, index) => {
        await uploadTaskPromise(input, index);
      })
    );

    const newVideoCoursesRef = doc(collection(db, "video_courses"));
    await setDoc(newVideoCoursesRef, {
      id: newVideoCoursesRef.id,
      name: courseName,
      cover: imageUrl,
      price: Number(price),
      introduction,
      introductionVideo: introductionVideoUrl,
      teacher_id: uid,
      chapters: newChapters,
      reviews: [],
      launchTime: Date.now(),
    });
    setShowMemberModal(false);
    Swal.fire({ title: "課程上架完成！", confirmButtonColor: "#5d7262", icon: "success" });
    router.push("/myCourses/launchedVideoCourses");
  };

  return (
    <>
      <LaunchForm onSubmit={handleSubmit}>
        <LaunchFormLabel>
          <LaunchFormLabelText>課程標題</LaunchFormLabelText>
          <LaunchFormLabelInput
            value={courseName}
            required
            onChange={(e) => {
              setCourseName(e.target.value);
            }}
          />
        </LaunchFormLabel>
        <LaunchFormLabel>
          <LaunchFormLabelText>課程價格</LaunchFormLabelText>
          <LaunchFormLabelInput
            type="number"
            step="50"
            min="0"
            max="10000"
            value={price}
            required
            onChange={(e) => {
              setPrice(e.target.value);
            }}
          />
        </LaunchFormLabel>
        <LaunchFormLabel>
          <LaunchFormLabelText>課程描述</LaunchFormLabelText>
          <Editor content={introduction} setContent={setIntroduction} style={{}} placeholder="請輸入課程簡介" />
        </LaunchFormLabel>
        <LaunchFormLabelFile>
          <LaunchFormLabelFileButton>上傳課程封面</LaunchFormLabelFileButton>
          <LaunchFormLabelInputFile
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              if (!e.target.files) return;
              setCoverPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </LaunchFormLabelFile>
        {coverPreview && (
          <Image src={coverPreview} alt="cover" width={500} height={300} style={{ marginBottom: "20px" }} />
        )}
        <LaunchFormLabelFile>
          <LaunchFormLabelFileButton>上傳課程介紹影片</LaunchFormLabelFileButton>
          <LaunchFormLabelInputFile
            type="file"
            accept="video/mp4,video/x-m4v,video/*"
            required
            onChange={(e) => {
              if (!e.target.files) return;
              setCoursePreview(e.target.files[0].name);
            }}
          />
          {coursePreview && (
            <span style={{ fontSize: "14px", textAlign: "right", marginLeft: "5px" }}>{coursePreview}</span>
          )}
        </LaunchFormLabelFile>
        <PlusButton
          type="button"
          onClick={() => {
            setChapters([
              ...chapters,
              { id: chapters.length + 1, title: "", units: [{ id: 1, title: "", filename: "", video: "" }] },
            ]);
          }}
        >
          課程章節++
        </PlusButton>
        {chapters.map((chapter, chapterIndex) => (
          <LaunchFormLabel key={chapter.id}>
            <LaunchFormLabelText>
              章節{chapterIndex + 1}：{chapter.title}
              <RemoveIcon
                src={Trash}
                alt="remove"
                onClick={() => {
                  Swal.fire({
                    text: `確定要刪除嗎？`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setChapters(chapters.filter((_, index) => index !== chapterIndex));
                    }
                  });
                }}
              />
            </LaunchFormLabelText>
            <LaunchFormLabelInput
              value={chapter.title}
              required
              onChange={(e) => {
                setChapters(
                  produce((draft) => {
                    const newChapter = draft.find((_, index) => index === chapterIndex);
                    if (!newChapter) return;
                    newChapter.title = e.target.value;
                  })
                );
              }}
            />
            {chapter.units.map((unit, unitIndex) => (
              <div key={unit.id}>
                <LaunchFormLabelText>
                  單元{unitIndex + 1}：{unit.title}
                  <RemoveIcon
                    src={Trash}
                    alt="remove"
                    onClick={() => {
                      Swal.fire({
                        text: `確定要刪除嗎？`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setChapters(
                            produce((draft) => {
                              const newChapter = draft.find((_, index) => index === chapterIndex);
                              if (!newChapter) return;
                              const newUnits = newChapter.units.filter((_, index) => index !== unitIndex);
                              newChapter.units = newUnits;
                            })
                          );
                        }
                      });
                    }}
                  />
                </LaunchFormLabelText>
                <LaunchFormLabelInput
                  value={unit.title}
                  required
                  onChange={(e) => {
                    setChapters(
                      produce((draft) => {
                        const newChapter = draft.find((_, index) => index === chapterIndex);
                        if (!newChapter) return;
                        newChapter.units[unitIndex].title = e.target.value;
                      })
                    );
                  }}
                />
                <LaunchFormLabelFile>
                  <span>影片上傳</span>
                  <Image src={Upload} alt="upload" width={20} height={20} style={{ margin: "0 5px" }} />
                  <LaunchFormLabelInputFile
                    type="file"
                    accept="video/mp4,video/x-m4v,video/*"
                    data-chapter={chapterIndex}
                    data-unit={unitIndex}
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setChapters(
                        produce((draft) => {
                          const newChapter = draft.find((_, index) => index === chapterIndex);
                          if (!newChapter || !e.target.files) return;
                          newChapter.units[unitIndex].filename = e.target.files[0].name;
                        })
                      );
                    }}
                  />
                  {chapter && (
                    <p style={{ fontSize: "14px", textAlign: "center" }}>{chapter.units[unitIndex].filename}</p>
                  )}
                </LaunchFormLabelFile>
              </div>
            ))}
            <PlusButton
              type="button"
              onClick={() => {
                setChapters(
                  produce((draft) => {
                    const newChapter = draft.find((_, index) => index === chapterIndex);
                    if (!newChapter) return;
                    newChapter.units.push({ id: newChapter.units.length + 1, title: "", filename: "", video: "" });
                  })
                );
              }}
            >
              單元++
            </PlusButton>
          </LaunchFormLabel>
        ))}
        <Button type="submit">確認送出</Button>
      </LaunchForm>
      {showMemberModal && <UploadProgressModal progressBar={progressBar} />}
    </>
  );
}
function BeTeacher({
  uid,
  setUserData,
}: {
  uid: string;
  setUserData: React.Dispatch<
    React.SetStateAction<{
      uid: string;
      email: string;
      identity: string;
      username: string;
      avatar: string;
    }>
  >;
}) {
  const router = useRouter();
  const [teacherIntroduction, setTeacherIntroduction] = useState("");
  const [teacherExperience, setTeacherExperience] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teacherIntroduction.trim() || !teacherExperience.trim())
      Swal.fire({ text: "請輸入自我介紹及教學經歷", confirmButtonColor: "#5d7262", icon: "warning" });

    const target = e.target as HTMLInputElement;
    const fileInput = target.querySelector("input[type=file]") as HTMLInputElement;
    if (fileInput.files) {
      const file = fileInput?.files[0];
      if (!file) {
        Swal.fire({ title: "請上傳證照唷！", confirmButtonColor: "#5d7262", icon: "warning" });
        return;
      }
      const storageRef = ref(storage, `certificate/${uid}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        () => {},
        () => {
          Swal.fire({ text: "上傳失敗，請再試一次！", confirmButtonColor: "#5d7262", icon: "error" });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            const docRef = doc(db, "users", uid);
            await updateDoc(docRef, {
              identity: "teacher",
              certificate: downloadURL,
              teacher_introduction: teacherIntroduction,
              teacher_experience: teacherExperience,
              beTeacherTime: Date.now(),
            });
            setUserData((prev) => ({ ...prev, identity: "teacher" }));
            Swal.fire({ text: "恭喜成為老師～可以開始排課囉！", confirmButtonColor: "#5d7262", icon: "success" });
            router.push("/myCourses/teacherCalendar");
          });
        }
      );
    }
  };
  return (
    <LaunchForm onSubmit={handleSubmit}>
      <LaunchFormLabel>
        <LaunchFormLabelText>自我介紹：</LaunchFormLabelText>
        <Editor
          content={teacherIntroduction}
          setContent={setTeacherIntroduction}
          style={{}}
          placeholder="簡短介紹讓同學認識～"
        />
      </LaunchFormLabel>
      <LaunchFormLabel>
        <LaunchFormLabelText>師資班及教學經歷：</LaunchFormLabelText>
        <Editor
          content={teacherExperience}
          setContent={setTeacherExperience}
          style={{}}
          placeholder="簡短描述過往經歷～"
        />
      </LaunchFormLabel>
      <LaunchFormLabelFile>
        <LaunchFormLabelFileButton>證照上傳</LaunchFormLabelFileButton>
        <LaunchFormLabelInputFile
          type="file"
          accept="image/*, application/pdf"
          onChange={(e) => {
            if (!e.target.files) return;
            setCertificatePreview(e.target.files[0].name);
          }}
        />
        {certificatePreview && (
          <span style={{ fontSize: "14px", textAlign: "right", marginLeft: "5px" }}>{certificatePreview}</span>
        )}
      </LaunchFormLabelFile>
      <Button type="submit">送出</Button>
    </LaunchForm>
  );
}
const routeTitle: Record<string, string> = {
  videoCourses: "我的影音課程（學生）",
  studentCalendar: "已預約課表（學生）",
  beTeacher: "我要當老師（學生）",
  launchedVideoCourses: "已上架影音課（老師）",
  launchVideoCourse: "影音課程上架（老師）",
  teacherCalendar: "排課行事曆（老師）",
};

function MyCourses() {
  const router = useRouter();
  const { category } = router.query;
  const { userData, setUserData } = useContext(AuthContext);
  const [teacherAuthority, setTeacherAuthority] = useState(false);

  useEffect(() => {
    if (category === "launchedVideoCourses" || category === "launchVideoCourse" || category === "teacherCalendar") {
      setTeacherAuthority(true);
    }
    if (category === "videoCourses" || category === "studentCalendar" || category === "beTeacher") {
      setTeacherAuthority(false);
    }
  }, [category]);

  return (
    <>
      <Head>{typeof category === "string" && <title>{routeTitle[category]} - Yoga Bear</title>}</Head>
      <Wrapper>
        <Bar>
          {userData.identity === "teacher" && (
            <BarSection>
              <BarTitle>學生</BarTitle>
              <ToggleButtonLabel
                onChange={(e: React.FormEvent<HTMLLabelElement>) => {
                  const target = e.target as HTMLInputElement;
                  const check = target.checked;
                  setTeacherAuthority(check);
                  if (teacherAuthority === false) {
                    router.push("/myCourses/launchedVideoCourses");
                  } else {
                    router.push("/myCourses/videoCourses");
                  }
                }}
              >
                <ToggleButton state={teacherAuthority} />
              </ToggleButtonLabel>
              <BarTitle>老師</BarTitle>
            </BarSection>
          )}
          {userData.identity && !teacherAuthority && (
            <BarSection>
              <BarLink active={typeof category === "string" && category === "videoCourses"}>
                <Link href="/myCourses/videoCourses">我的影音課程</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "studentCalendar"}>
                <Link href="/myCourses/studentCalendar">已預約課表</Link>
              </BarLink>
              {userData.identity === "student" && (
                <BarLink active={typeof category === "string" && category === "beTeacher"}>
                  <Link href="/myCourses/beTeacher">我要當老師</Link>
                </BarLink>
              )}
            </BarSection>
          )}
          {userData.identity === "teacher" && teacherAuthority && (
            <BarSection>
              <BarLink active={typeof category === "string" && category === "launchedVideoCourses"}>
                <Link href="/myCourses/launchedVideoCourses">已上架影音課</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "launchVideoCourse"}>
                <Link href="/myCourses/launchVideoCourse">影音課程上架</Link>
              </BarLink>
              <BarLink active={typeof category === "string" && category === "teacherCalendar"}>
                <Link href="/myCourses/teacherCalendar">排課行事曆</Link>
              </BarLink>
            </BarSection>
          )}
        </Bar>
        <Main>
          {category === "videoCourses" && <VideoCourses uid={userData.uid} />}
          {category === "launchVideoCourse" && <LaunchVideoCourse uid={userData.uid} />}
          {category === "launchedVideoCourses" && <LaunchedVideoCourses uid={userData.uid} />}
          {category === "teacherCalendar" && (
            <CalendarWrapper>
              <TeacherCalendar uid={userData.uid} name={userData.username} />
            </CalendarWrapper>
          )}
          {category === "studentCalendar" && (
            <CalendarWrapper>
              <StudentCalendar userData={userData} />
            </CalendarWrapper>
          )}
          {category === "beTeacher" && <BeTeacher uid={userData.uid} setUserData={setUserData} />}
        </Main>
      </Wrapper>
    </>
  );
}

export default MyCourses;
