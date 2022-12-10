import React, { useState } from "react";
import styled from "styled-components";
import produce from "immer";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/router";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import { createVideoCourse } from "../../utils/firestore";
import Editor from "../editor/editor";
import Upload from "../../../public/upload.png";
import Trash from "../../../public/trash.png";
import UploadProgressModal from "./uploadProgressModal";

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
    width: 520px;
    height: 480px;
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

const LaunchFormLabelInput = styled.input`
  display: block;
  width: 520px;
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
const RemoveIcon = styled(Image)`
  width: 20px;
  height: auto;
  cursor: pointer;
`;

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
    const fileInputs: HTMLInputElement[] = Array.from(document.querySelectorAll("input[type=file]"));
    if (fileInputs.some((fileInput) => fileInput.files?.length === 0)) {
      Swal.fire({ text: "您有檔案沒上傳唷～請確認後再送出", confirmButtonColor: "#5d7262", icon: "error" });
      return;
    }
    if (chapters.length === 0) {
      Swal.fire({ text: "至少要有一個章節唷！", confirmButtonColor: "#5d7262", icon: "error" });
      return;
    }
    if (chapters.some((chapter) => chapter.units.length === 0)) {
      Swal.fire({ text: "每章節至少要有一個單元唷！", confirmButtonColor: "#5d7262", icon: "error" });
      return;
    }
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

    await Promise.all(
      fileInputs.map(async (input: HTMLInputElement, index) => {
        await uploadTaskPromise(input, index);
      })
    );
    const courseData = {
      name: courseName,
      cover: imageUrl,
      price: Number(price),
      introduction,
      introductionVideo: introductionVideoUrl,
      teacher_id: uid,
      chapters: newChapters,
      reviews: [],
    };
    await createVideoCourse(courseData);
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
          <Editor content={introduction} setContent={setIntroduction} placeholder="請輸入課程簡介" />
        </LaunchFormLabel>
        <LaunchFormLabelFile>
          <LaunchFormLabelFileButton>上傳課程封面</LaunchFormLabelFileButton>
          <LaunchFormLabelInputFile
            type="file"
            accept="image/*"
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

export default LaunchVideoCourse;
