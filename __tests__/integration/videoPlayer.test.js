import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import VideoPlayer from "../../src/components/videoPlayer";

const theme = {
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
/* eslint-disable */
describe("videoPlayer component", () => {
  test("renders a video-player", () => {
    render(
      <ThemeProvider theme={theme}>
        <VideoPlayer />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId("video", {
      name: /testing next\.js applications/i,
    });

    expect(toggleButton).toBeInTheDocument();
  });
});
