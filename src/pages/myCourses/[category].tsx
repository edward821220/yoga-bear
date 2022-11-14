import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import produce from "immer";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../contexts/authContext";
import { storage, db } from "../../../lib/firebase";
import Modal from "../../components/modal";
import Bear from "../../../public/bear.png";
import Trash from "../../../public/trash.png";
import TeacherCalendar from "../../components/calendar/teacherCalendar";
import StudentCalendar from "../../components/calendar/studentCalendar";
import EmptyStar from "../../../public/star-empty.png";
import Star from "../../../public/star.png";

const Wrapper = styled.div`
  background-color: #dfb098;
  min-height: calc(100vh - 182px);
  display: flex;
  padding: 20px;
`;
const SideBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: #fff;
  width: 20%;
  height: 500px;
  border: 2px solid #654116;
  border-radius: 5px;
  margin-right: 20px;
`;
const SideBarSection = styled.ul`
  margin-bottom: 50px;
`;
const SideBarTitle = styled.h3`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #654116;
`;
const SideBarLink = styled.li`
  font-size: 16px;
  margin-bottom: 20px;

  a {
    transition: 0.2s color linear;
    color: #654116;
    &:hover {
      color: #5d7262;
    }
  }
`;
const Main = styled.div`
  width: 80%;
`;
const MainTitle = styled.h2`
  font-size: 36px;
  text-align: center;
  margin-bottom: 30px;
`;
const LauchForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
  background-color: #fff;
  border: 2px solid #654116;
  border-radius: 5px;
  padding: 20px;
  margin: 0 auto;
  color: #654116;
`;
const LauchFormLabel = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const LauchFormLabelText = styled.p`
  margin-bottom: 10px;
  width: 100%;
`;
const LauchFormLabelInput = styled.input`
  display: block;
  width: 500px;
  line-height: 24px;
  margin-bottom: 20px;
`;
const LauchFormLabelTextarea = styled.textarea`
  width: 500px;
  height: 200px;
  margin-bottom: 20px;
  resize: none;
`;
const Button = styled.button`
  color: #654116;
  background-color: #f8a637;
  width: 100px;
  margin-bottom: 10px;
  padding: 10px;
`;
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
`;
const RemoveIcon = styled.div`
  margin-bottom: 10px;
`;
const MyCoursesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;
const MyCourse = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: #654116;
  align-items: center;
  flex-basis: 48%;
  background-color: #fff;
  padding: 10px;
  border: 2px solid #654116;
  border-radius: 5px;
  margin-right: 20px;
  margin-bottom: 20px;
`;
const CourseCover = styled.div`
  position: relative;
  width: 480px;
  height: 270px;
  margin-bottom: 10px;
`;
const CourseTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 10px;
`;
const CalendarWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
`;
const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #654116;
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
`;

interface Review {
  userId: string;
  score: number;
  comments: string;
}

function VideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<{ name: string; cover: string; id: string; reviews?: Review[] }[]>();
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
          const datas = await getDoc(videoDocRef);
          if (datas.exists() && datas) {
            results.push({
              id: datas.data().id,
              name: datas.data().name,
              cover: datas.data().cover,
              reviews: datas.data().reviews,
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
    <MyCoursesList>
      {courses?.map((course, courseIndex) => (
        <MyCourse key={course.name}>
          <CourseCover>
            <Link href={`/myCourses/classRoom/videoRoom/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="cover" />
            </Link>
          </CourseCover>
          <CourseTitle>{course.name}</CourseTitle>
          {course?.reviews?.some((review) => review.userId === uid) || (
            <ButtonWrapper>
              <Button
                type="button"
                onClick={() => {
                  setShowReviewModal(courseIndex);
                }}
              >
                評價
              </Button>
            </ButtonWrapper>
          )}
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
                      alert("請點選星星評分");
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
                    alert("感謝您的評論～您的支持是我們最大的動力！");
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
        </MyCourse>
      ))}
    </MyCoursesList>
  );
}
function LaunchedVideoCourses({ uid }: { uid: string }) {
  const [courses, setCourses] = useState<{ name: string; cover: string; id: string }[]>();

  useEffect(() => {
    const getLaunchedVideoCourses = async () => {
      if (!uid) return;
      const usersRef = collection(db, "video_courses");
      const teachersQuery = query(usersRef, where("teacher_id", "==", uid));
      const querySnapshot = await getDocs(teachersQuery);
      const launchedVideoCourses = querySnapshot.docs.map((course) => {
        const { name, cover, id } = course.data();
        return { name, cover, id };
      });
      setCourses(launchedVideoCourses);
    };
    getLaunchedVideoCourses();
  }, [uid]);

  if (courses?.length === 0) {
    return <p>目前沒有課程唷！</p>;
  }
  return (
    <MyCoursesList>
      {courses?.map((course) => (
        <MyCourse key={course.name}>
          <CourseCover>
            <Link href={`/myCourses/classRoom/videoRoom/${course.id}`}>
              <Image src={course.cover} alt="cover" fill sizes="cover" />
            </Link>
          </CourseCover>
          <CourseTitle>{course.name}</CourseTitle>
        </MyCourse>
      ))}
    </MyCoursesList>
  );
}
function UploadProgressModal({ progressBar }: { progressBar: { file: string; progress: number } }) {
  const handleClose = () => {
    alert("課程上傳中，請勿關閉視窗！");
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
function LaunchVideoCourse({ uid }: { uid: string }) {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [price, setPrice] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [chapters, setChapters] = useState<
    { id: number; title: string; units: { id: number; title: string; video: string }[] }[]
  >([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [progressBar, setProgressBar] = useState<{ file: string; progress: number }>({ file: "", progress: 0 });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMemberModal(true);

    let newChapters = [...chapters];
    let imageUrl = "";
    let introductionVideoUrl = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function uploadTaskPromise(input: any, index: number) {
      return new Promise((resolve, reject) => {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-argument */
        /* eslint-disable @typescript-eslint/restrict-template-expressions */
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
              targetChapter.units[input.dataset.unit].video = downloadUrl;
            });
            resolve(downloadUrl);
          }
        );
      });
    }
    const fileInputs = Array.from(document.querySelectorAll("input[type=file]"));
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fileInputs.map(async (input: any, index) => {
        await uploadTaskPromise(input, index);
      })
    );

    const newVideoCoursesRef = doc(collection(db, "video_courses"));
    await setDoc(newVideoCoursesRef, {
      id: newVideoCoursesRef.id,
      name: courseName,
      cover: imageUrl,
      price,
      introduction,
      introductionVideo: introductionVideoUrl,
      teacher_id: uid,
      chapters: newChapters,
      reviews: [],
    });
    setShowMemberModal(false);
    alert("課程上架完成！");
    router.push("/myCourses/videoCourses");
  };

  return (
    <>
      <LauchForm onSubmit={handleSubmit}>
        <LauchFormLabel>
          <LauchFormLabelText>課程標題</LauchFormLabelText>
          <LauchFormLabelInput
            value={courseName}
            required
            onChange={(e) => {
              setCourseName(e.target.value);
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>課程價格</LauchFormLabelText>
          <LauchFormLabelInput
            value={price}
            required
            onChange={(e) => {
              setPrice(e.target.value);
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>課程描述</LauchFormLabelText>
          <LauchFormLabelTextarea
            value={introduction}
            required
            onChange={(e) => {
              setIntroduction(e.target.value);
            }}
          />
        </LauchFormLabel>

        <LauchFormLabel>
          <LauchFormLabelText>上傳課程封面</LauchFormLabelText>
          <LauchFormLabelInput
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              if (!e.target.files) return;
              setCoverPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {coverPreview && <Image src={coverPreview} alt="cover" width={500} height={300} />}
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>上傳課程介紹影片</LauchFormLabelText>
          <LauchFormLabelInput type="file" accept="video/mp4,video/x-m4v,video/*" required />
        </LauchFormLabel>
        <Button
          type="button"
          onClick={() => {
            setChapters([
              ...chapters,
              { id: chapters.length + 1, title: "", units: [{ id: 1, title: "", video: "" }] },
            ]);
          }}
        >
          課程章節++
        </Button>
        {chapters.map((chapter, chapterIndex) => (
          <LauchFormLabel key={chapter.id}>
            <LauchFormLabelText>
              章節{chapterIndex + 1}：{chapter.title}
            </LauchFormLabelText>
            <LauchFormLabelInput
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
            <RemoveIcon>
              <Image
                src={Trash}
                alt="trash"
                width={24}
                onClick={() => {
                  setChapters(chapters.filter((_, index) => index !== chapterIndex));
                }}
              />
            </RemoveIcon>
            {chapter.units.map((unit, unitIndex) => (
              <div key={unit.id}>
                <LauchFormLabelText>
                  單元{unitIndex + 1}：{unit.title}
                </LauchFormLabelText>
                <LauchFormLabelInput
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
                <LauchFormLabelInput
                  type="file"
                  accept="video/mp4,video/x-m4v,video/*"
                  data-chapter={chapterIndex}
                  data-unit={unitIndex}
                />
                <RemoveIcon>
                  <Image
                    src={Trash}
                    alt="trash"
                    width={24}
                    onClick={() => {
                      setChapters(
                        produce((draft) => {
                          const newChapter = draft.find((_, index) => index === chapterIndex);
                          if (!newChapter) return;
                          const newUnits = newChapter.units.filter((_, index) => index !== unitIndex);
                          newChapter.units = newUnits;
                        })
                      );
                    }}
                  />
                </RemoveIcon>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => {
                setChapters(
                  produce((draft) => {
                    const newChapter = draft.find((_, index) => index === chapterIndex);
                    if (!newChapter) return;
                    newChapter.units.push({ id: newChapter.units.length + 1, title: "", video: "" });
                  })
                );
              }}
            >
              單元++
            </Button>
          </LauchFormLabel>
        ))}
        <Button type="submit">確認送出</Button>
      </LauchForm>
      {showMemberModal && <UploadProgressModal progressBar={progressBar} />}
    </>
  );
}

function MyCourses() {
  const router = useRouter();
  const { userData } = useContext(AuthContext);

  return (
    <Wrapper>
      <SideBar>
        <SideBarSection>
          <SideBarTitle>學生專區</SideBarTitle>
          <SideBarLink>
            <Link href="/myCourses/videoCourses">我的影音課程</Link>
          </SideBarLink>
          <SideBarLink>
            <Link href="/myCourses/studentCalendar">我的課表</Link>
          </SideBarLink>
        </SideBarSection>
        {userData.identity === "teacher" && (
          <SideBarSection>
            <SideBarTitle>老師專區</SideBarTitle>
            <SideBarLink>
              <Link href="/myCourses/launchedVideoCourses">已上架影音課程</Link>
            </SideBarLink>
            <SideBarLink>
              <Link href="/myCourses/launchVideoCourse">影音課程上架</Link>
            </SideBarLink>
            <SideBarLink>
              <Link href="/myCourses/teacherCalendar">排課行事曆</Link>
            </SideBarLink>
          </SideBarSection>
        )}
      </SideBar>
      <Main>
        {router.query.category === "videoCourses" && <VideoCourses uid={userData.uid} />}
        {router.query.category === "launchVideoCourse" && <LaunchVideoCourse uid={userData.uid} />}
        {router.query.category === "launchedVideoCourses" && <LaunchedVideoCourses uid={userData.uid} />}
        {router.query.category === "teacherCalendar" && (
          <CalendarWrapper>
            <TeacherCalendar uid={userData.uid} />
          </CalendarWrapper>
        )}
        {router.query.category === "studentCalendar" && (
          <CalendarWrapper>
            <StudentCalendar userData={userData} />
          </CalendarWrapper>
        )}
      </Main>
    </Wrapper>
  );
}

export default MyCourses;
