import Head from "next/head";
import type { AppProps } from "next/app";
import { createGlobalStyle, DefaultTheme, ThemeProvider } from "styled-components";
import { Reset } from "styled-reset";
import React from "react";
import { RecoilRoot } from "recoil";
import Header from "../components/header";
import { AuthContextProvider } from "../contexts/authContext";

const GlobalStyle = createGlobalStyle`
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}
body {
  box-sizing: border-box;
  font-family: "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", Roboto, "Helvetica Neue", Arial, sans-serif;
}
img {
  display: block;
  max-width: 100%;
  height: auto;
}
a {
  text-decoration: none;
  color: #000000;
}
`;
const theme: DefaultTheme = {
  colors: {
    color1: "#f1ead8",
    color2: "#654116",
    color3: "#fff",
    color4: "#5d7262",
    color5: "#f7ecde",
    color6: "#f2deba;",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" key="viewport" />
      </Head>
      <Reset />
      <GlobalStyle />
      <AuthContextProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <Header />
            <Component {...pageProps} />
          </ThemeProvider>
        </RecoilRoot>
      </AuthContextProvider>
    </>
  );
}
