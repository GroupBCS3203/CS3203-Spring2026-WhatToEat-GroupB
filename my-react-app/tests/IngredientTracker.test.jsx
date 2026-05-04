import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import { vi, test, expect } from "vitest";
import App from "../src/App";

test("renders Ingredient Tracker tab", () => {
  render(<App />);
  
  // Check if the Ingredient Tracker tab exists
  const tabElement = screen.getByText("Ingredient Tracker");
  expect(tabElement).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Ingredient name'), {
    target: { value: 'Salt' }
  });

  fireEvent.change(screen.getByPlaceholderText('Amount of the ingredient'), {
    target: { value: '1 gallon' }
  });

  fireEvent.change(screen.getByPlaceholderText('Expiration date of the ingredient'), {
    target: { value: '2030-05-01' }
  });
  fireEvent.click(screen.getByText('ingredients'));
  fireEvent.click(screen.getByText('Add to ingredient list'));


  const ingredient_row = screen.getByText("remove Ingredient");
  expect(ingredient_row).toBeInTheDocument();
});
