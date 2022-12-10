import { create } from "react-test-renderer";
import ToggleButton from "../../src/components/toggleButton";

/* eslint-disable */
describe("Jest Snapshot testing suite", () => {
  test("Matches DOM Snapshot", () => {
    const tree = create(<ToggleButton />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
