import { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import Swal from "sweetalert2";
import { storage } from "../../../lib/firebase";
import { updateTeacherData } from "../../utils/firestore";
import Editor from "../editor/editor";

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
    if (!teacherIntroduction.trim() || !teacherExperience.trim()) {
      Swal.fire({ text: "????????????????????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    const target = e.target as HTMLInputElement;
    const fileInput = target.querySelector("input[type=file]") as HTMLInputElement;
    if (fileInput.files) {
      const file = fileInput?.files[0];
      if (!file) {
        Swal.fire({ title: "?????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
        return;
      }
      const storageRef = ref(storage, `certificate/${uid}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        () => {},
        () => {
          Swal.fire({ text: "?????????????????????????????????", confirmButtonColor: "#5d7262", icon: "error" });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateTeacherData(uid, downloadURL, teacherIntroduction, teacherExperience);
            setUserData((prev) => ({ ...prev, identity: "teacher" }));
            Swal.fire({ text: "?????????????????????????????????????????????", confirmButtonColor: "#5d7262", icon: "success" });
            router.push("/myCourses/teacherCalendar");
          });
        }
      );
    }
  };
  return (
    <LaunchForm onSubmit={handleSubmit}>
      <LaunchFormLabel>
        <LaunchFormLabelText>???????????????</LaunchFormLabelText>
        <Editor content={teacherIntroduction} setContent={setTeacherIntroduction} placeholder="??????????????????????????????" />
      </LaunchFormLabel>
      <LaunchFormLabel>
        <LaunchFormLabelText>???????????????????????????</LaunchFormLabelText>
        <Editor content={teacherExperience} setContent={setTeacherExperience} placeholder="???????????????????????????" />
      </LaunchFormLabel>
      <LaunchFormLabelFile>
        <LaunchFormLabelFileButton>????????????</LaunchFormLabelFileButton>
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
      <Button type="submit">??????</Button>
    </LaunchForm>
  );
}
export default BeTeacher;
