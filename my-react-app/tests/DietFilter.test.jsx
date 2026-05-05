import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import { vi, test, expect } from "vitest";
import App from "../src/App";

test("Check the dietary restriction page", () => {
  render(<App />);

  // Check if the dietary restrictions tab exists
  const tabElement = screen.getByText("Dietary Filter");
  expect(tabElement).toBeInTheDocument();

});
