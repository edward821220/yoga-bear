import { useRef, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import imageCompression from "browser-image-compression";
import ReactQuill, { ReactQuillProps } from "react-quill";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import "react-quill/dist/quill.snow.css";

interface EditorInterface extends ReactQuillProps {
  forwardedRef: React.RefObject<ReactQuill>;
}

/* eslint-disable react/display-name */
const Editor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    /* eslint-disable-next-line func-names */
    return function ({ forwardedRef, ...props }: EditorInterface) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
  }
);
const formats = [
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

function RichEditor({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  const quillRef = useRef<ReactQuill>(null);
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const { files } = input;
      if (!files) return;
      const file = files[0];
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        const storageRef = ref(storage, `article/${Date.now()}-${compressedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);
        uploadTask.on(
          "state_changed",
          () => {},
          () => {
            Swal.fire({ text: "上傳失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const quillEditor = quillRef?.current?.editor;
            const range = quillRef?.current?.selection;
            if (!range) return;
            const { index } = range;
            quillEditor?.insertEmbed(index + 1, "image", downloadUrl);
          }
        );
      } catch (error) {
        Swal.fire({ text: "圖片壓縮失敗！請再試一次", confirmButtonColor: "#5d7262", icon: "error" });
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  return (
    <Editor
      theme="snow"
      value={content}
      onChange={setContent}
      modules={modules}
      formats={formats}
      forwardedRef={quillRef}
    />
  );
}

export default RichEditor;
