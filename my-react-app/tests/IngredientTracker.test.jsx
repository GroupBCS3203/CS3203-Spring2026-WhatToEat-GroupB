import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { vi, test, expect } from "vitest";
import App from "../src/App";

test("renders Ingredient Tracker tab", () => {
  render(<App />);
  
  // Check if the Ingredient Tracker tab exists
  const tabElement = screen.getByText("Ingredient Tracker");
  expect(tabElement).toBeInTheDocument();

  //chech if adding an ingredient adds it to the list
  addIngredient();
  const ingredient_row = screen.getByText("remove button placeholder");
  expect(ingredient_row).toBeInTheDocument();
});
