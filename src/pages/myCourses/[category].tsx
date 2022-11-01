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
  height: 300px;
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
  const [coverPreview, setCoverPreview] = useState("");
  const [step, setStep] = useState(1);
  const [chapters, setChapters] = useState<
    { serial: number; title: string; units: { serial: number; title: string; video: string }[] }[]
  >([]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log(e.target);
  };

  return (
    <>
      <MainTitle>影音課程上架</MainTitle>
      <LauchForm onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <LauchFormLabel>
              <LauchFormLabelText>課程標題</LauchFormLabelText>
              <LauchFormLabelInput />
            </LauchFormLabel>
            <LauchFormLabel>
              <LauchFormLabelText>課程描述</LauchFormLabelText>
              <LauchFormLabelTextarea />
            </LauchFormLabel>
            <LauchFormLabel>
              <LauchFormLabelText>上傳課程封面</LauchFormLabelText>
              <LauchFormLabelInput
                type="file"
                accept="image/*"
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
                setStep((prev) => prev + 1);
              }}
            >
              下一步
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button
              type="button"
              onClick={() => {
                setStep((prev) => prev - 1);
              }}
            >
              回上一步
            </Button>
            <LauchFormLabelText style={{ textAlign: "center" }}>上傳影片</LauchFormLabelText>
            <Button
              type="button"
              onClick={() => {
                setChapters([
                  ...chapters,
                  { serial: chapters.length + 1, title: "", units: [{ serial: 1, title: "", video: "" }] },
                ]);
              }}
            >
              新增章節
            </Button>
            {chapters.map((chapter, chapterIndex) => (
              <LauchFormLabel key={chapter.serial}>
                <LauchFormLabelText>
                  章節{chapter.serial}：{chapter.title}
                </LauchFormLabelText>
                <LauchFormLabelInput
                  value={chapter.title}
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
                  新增單元
                </Button>
              </LauchFormLabel>
            ))}
            <Button type="submit">確認送出</Button>
          </>
        )}
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
