import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../src/components/header";
import "@testing-library/jest-dom";

/* eslint-disable */
test("display header", async () => {
  render(<Header />);

  // ACT
  fireEvent.click(screen.getByTestId("memberIcon"));
  // await screen.findByRole("heading");

  // ASSERT
  // expect(screen.getByTestId("heading")).toHaveTextContent("hello there");
  expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument();
});
