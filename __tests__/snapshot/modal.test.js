import { create } from "react-test-renderer";
import Modal from "../../src/components/modal";

/* eslint-disable */
describe("Jest Snapshot testing suite", () => {
  test("Matches DOM Snapshot", () => {
    const tree = create(<Modal />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
