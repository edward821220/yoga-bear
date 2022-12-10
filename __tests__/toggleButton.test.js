import { render, screen } from "@testing-library/react";
import ToggleButton from "../src/components/toggleButton";

/* eslint-disable */
describe("modal component", () => {
  test("renders a modal", () => {
    render(<ToggleButton />);

    const toggleButton = screen.getByTestId("check-box", {
      name: /testing next\.js applications/i,
    });

    expect(toggleButton).toBeInTheDocument();
  });
});
