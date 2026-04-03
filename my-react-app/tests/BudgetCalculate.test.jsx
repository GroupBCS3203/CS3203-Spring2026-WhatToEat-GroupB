import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { test, expect } from "vitest";
import App from "../src/App";

test("accepts valid numeric input and displays correct budget", async () => {
    render(<App />);

    const input = screen.getByPlaceholderText("Enter monthly income");
    const button = screen.getByText("Calculate Budget");

    fireEvent.change(input, { target: { value: "2000" } });
    fireEvent.click(button);

    const result = await screen.findByText("Your budget: $300.00");
    
    expect(result).toBeInTheDocument();
});