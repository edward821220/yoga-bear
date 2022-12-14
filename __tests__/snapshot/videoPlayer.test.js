import { create } from "react-test-renderer";
import { ThemeProvider } from "styled-components";
import VideoPlayer from "../../src/components/videoCourse/videoPlayer";

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
test("Matches DOM Snapshot", () => {
  const tree = create(
    <ThemeProvider theme={theme}>
      <VideoPlayer />
    </ThemeProvider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
