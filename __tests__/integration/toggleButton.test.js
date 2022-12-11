import { render, screen, fireEvent } from "@testing-library/react";
import ToggleButton from "../../src/components/toggleButton";

/* eslint-disable */
describe("toggleButton component", () => {
  test("renders a toggleButton", () => {
    const handleClick = jest.fn();
    render(<ToggleButton onClick={handleClick} />);

    const toggleButton = screen.getByTestId("check-box", {
      name: /testing next\.js applications/i,
    });
    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
