import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import "react-quill/dist/quill.snow.css";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 50px;
  min-height: calc(100vh - 127.6167px - 58px);
`;
const Title = styled.h2`
  font-size: 18px;
  text-align: center;
  margin-bottom: 30px;
`;
const Content = styled.div`
  border: 1px solid gray;
  padding: 10px;
  ol {
    list-style: decimal;
  }
  ul {
    list-style: circle;
  }
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.5em;
  }
  blockquote {
    margin: 20px;
    padding: 10px;
    background-color: #eeeeee;
    border-left: 5px solid #00aae1;
    margin: 15px 30px 0 10px;
    padding-left: 20px;
    border-radius: 6px;
  }
`;

function Article() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Record<string, string>>();

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const getArticle = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle(docSnap.data());
      }
    };
    getArticle();
  });

  return (
    <Wrapper>
      <Title>{article?.title}</Title>
      {/* eslint-disable-next-line react/no-danger */}
      {article && <Content className="ql-editor" dangerouslySetInnerHTML={{ __html: article.content }} />}
    </Wrapper>
  );
}

export default Article;
