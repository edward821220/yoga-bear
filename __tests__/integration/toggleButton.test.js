import { render, screen, fireEvent } from "@testing-library/react";
import ToggleButton from "../../src/components/toggleButton";

/* eslint-disable */
describe("toggleButton component", () => {
  test("renders a toggleButton", () => {
    const handleChange = jest.fn();
    render(<ToggleButton onChange={handleChange} />);

    const toggleButton = screen.getByTestId("check-box", {
      name: /testing next\.js applications/i,
    });
    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
