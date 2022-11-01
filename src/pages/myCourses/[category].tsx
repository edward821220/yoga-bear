import React, { useState } from "react";
import styled from "styled-components";
import produce from "immer";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../lib/firebase";

const Wrapper = styled.div`
  display: flex;
  min-height: 77vh;
  padding: 20px 0;
`;
const SideBar = styled.div`
  width: 20%;
  text-align: center;
`;
const SideBarSection = styled.ul`
  margin-bottom: 50px;
`;
const SideBarTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  color: #097be6;
`;
const SideBarLink = styled.li`
  font-size: 16px;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
  padding: 10px;
  width: 100px;
`;

function VideoCourses() {
  return <MainTitle>我的影音課程</MainTitle>;
}
function LaunchedVideoCourses() {
  return <MainTitle>已上架影音課程</MainTitle>;
}
function LaunchVideoCourse() {
  const [courseName, setCourseName] = useState("");
  const [price, setPrice] = useState("");
  const [detail, setDetail] = useState<{ courseIntroduction: string; teacherIntroduction: string }>({
    courseIntroduction: "",
    teacherIntroduction: "",
  });
  const [coverPreview, setCoverPreview] = useState("");
  const [chapters, setChapters] = useState<
    { serial: number; title: string; units: { serial: number; title: string; video: string }[] }[]
  >([]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const fileInputs = Array.from(document.querySelectorAll("input[type=file]"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileInputs.forEach((input: any, index) => {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      /* eslint-disable @typescript-eslint/restrict-template-expressions */
      const file = input.files[0];
      const storageRef = ref(storage, `${courseName}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          alert(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(downloadUrl);
          // setChapters(
          //   produce((draft) => {
          //     const newChapter = draft.find((_, chapterIndex) => index === chapterIndex);
          //     if (!newChapter) return;
          //     newChapter.units[index].video = downloadUrl;
          //   })
          // );
        }
      );
    });
  };

  return (
    <>
      <MainTitle>影音課程上架</MainTitle>
      <LauchForm onSubmit={handleSubmit}>
        <LauchFormLabel>
          <LauchFormLabelText>課程標題</LauchFormLabelText>
          <LauchFormLabelInput
            value={courseName}
            // required
            onChange={(e) => {
              setCourseName(e.target.value);
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>課程價格</LauchFormLabelText>
          <LauchFormLabelInput
            value={price}
            // required
            onChange={(e) => {
              setPrice(e.target.value);
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>課程描述</LauchFormLabelText>
          <LauchFormLabelTextarea
            value={detail.courseIntroduction}
            // required
            onChange={(e) => {
              setDetail({ ...detail, courseIntroduction: e.target.value });
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>老師介紹</LauchFormLabelText>
          <LauchFormLabelTextarea
            value={detail.teacherIntroduction}
            // required
            onChange={(e) => {
              setDetail({ ...detail, teacherIntroduction: e.target.value });
            }}
          />
        </LauchFormLabel>
        <LauchFormLabel>
          <LauchFormLabelText>上傳課程封面</LauchFormLabelText>
          <LauchFormLabelInput
            type="file"
            accept="image/*"
            // required
            onChange={(e) => {
              if (!e.target.files) return;
              setCoverPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {coverPreview && <Image src={coverPreview} alt="cover" width={500} height={300} />}
        </LauchFormLabel>
        <Button
          type="button"
          onClick={() => {
            setChapters([
              ...chapters,
              { serial: chapters.length + 1, title: "", units: [{ serial: 1, title: "", video: "" }] },
            ]);
          }}
        >
          課程章節++
        </Button>
        {chapters.map((chapter, chapterIndex) => (
          <LauchFormLabel key={chapter.serial}>
            <LauchFormLabelText>
              章節{chapter.serial}：{chapter.title}
            </LauchFormLabelText>
            <LauchFormLabelInput
              value={chapter.title}
              // required
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
              <div key={unit.serial}>
                <LauchFormLabelText>
                  單元{unit.serial}：{unit.title}
                </LauchFormLabelText>
                <LauchFormLabelInput
                  value={unit.title}
                  // required
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
                <LauchFormLabelInput type="file" accept="video/mp4,video/x-m4v,video/*" />
              </div>
            ))}
            <Button
              type="button"
              onClick={() => {
                setChapters(
                  produce((draft) => {
                    const newChapter = draft.find((_, index) => index === chapterIndex);
                    if (!newChapter) return;
                    newChapter.units.push({ serial: newChapter.units.length + 1, title: "", video: "" });
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
    </>
  );
}

function MyCourses() {
  const router = useRouter();

  return (
    <Wrapper>
      <SideBar>
        <SideBarSection>
          <SideBarTitle>學生專區</SideBarTitle>
          <SideBarLink>
            <Link href="/myCourses/videoCourses">我的影音課程</Link>
          </SideBarLink>
          <SideBarLink>
            <Link href="/myCourses/classRoom/studentRoom/01">視訊課程教室</Link>
          </SideBarLink>
        </SideBarSection>
        <SideBarSection>
          <SideBarTitle>老師專區</SideBarTitle>
          <SideBarLink>
            <Link href="/myCourses/launchedVideoCourses">已上架影音課程</Link>
          </SideBarLink>
          <SideBarLink>
            <Link href="/myCourses/launchVideoCourse">影音課程上架</Link>
          </SideBarLink>
          <SideBarLink>
            <Link href="/myCourses/classRoom/teacherRoom/01">視訊課程教室</Link>
          </SideBarLink>
        </SideBarSection>
      </SideBar>
      <Main>
        {router.query.category === "videoCourses" && <VideoCourses />}
        {router.query.category === "launchVideoCourse" && <LaunchVideoCourse />}
        {router.query.category === "launchedVideoCourses" && <LaunchedVideoCourses />}
      </Main>
    </Wrapper>
  );
}

export default MyCourses;
