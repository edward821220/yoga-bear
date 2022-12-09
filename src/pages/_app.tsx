import Head from "next/head";
import { createGlobalStyle, DefaultTheme, ThemeProvider } from "styled-components";
import { useRouter } from "next/router";
import { Reset } from "styled-reset";
import React from "react";
import { RecoilRoot } from "recoil";
import ErrorBoundary from "../components/errorBoundary";
import Header from "../components/header";
import { AuthContextProvider } from "../contexts/authContext";
import type { AppProps } from "next/app";

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
.swal2-container {
    z-index: 10000 !important;    
}
`;
const theme: DefaultTheme = {
  colors: {
    color1: "#fff",
    color2: "#654116",
    color3: "#5d7262",
    color4: "#f7ecde",
    color5: "#f2deba",
    color6: "#00000080",
    color7: "#3f3f3f",
    color8: "#f4f7f7",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" key="viewport" />
        <link rel="shortcut icon" href="/member.png" />
      </Head>
      <Reset />
      <GlobalStyle />
      <AuthContextProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <Header />
            <ErrorBoundary key={router.pathname}>
              <Component {...pageProps} />
            </ErrorBoundary>
          </ThemeProvider>
        </RecoilRoot>
      </AuthContextProvider>
    </>
  );
}
