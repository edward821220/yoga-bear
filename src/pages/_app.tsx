import Head from "next/head";
import type { AppProps } from "next/app";
import { createGlobalStyle } from "styled-components";
import { Reset } from "styled-reset";
import Header from "../components/header";
import Footer from "../components/footer";
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
  font-family: "Poppins", Roboto, "Helvetica Neue", Arial, sans-serif;
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Reset />
      <GlobalStyle />
      <AuthContextProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </AuthContextProvider>
    </>
  );
}
