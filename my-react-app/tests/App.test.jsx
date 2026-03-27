import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { vi, test, expect } from "vitest";
import App from "../src/App";

// Fake fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([
            { _id: "1", title: "Fake Recipe" }
        ])
    })
);

test("renders recipes from API", async () => {
    render(<App />);

    const item = await screen.findByText("Fake Recipe");

    expect(item).toBeInTheDocument();
});