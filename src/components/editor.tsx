import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";

const Quill = dynamic(() => import("react-quill"), { ssr: false });

function Editor({
  content,
  setContent,
  style,
  placeholder,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  style: Record<string, string>;
  placeholder: string;
}) {
  return <Quill style={style} theme="bubble" value={content} onChange={setContent} placeholder={placeholder} />;
}

export default Editor;
