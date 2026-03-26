import { render, screen } from "@testing-library/react";
import App from "../src/App";

// Fake fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([
            { _id: "1", title: "Fake Recipe" }
        ])
    })
);

test("renders recipes from API", async () => {
    render(<App />);

    const item = await screen.findByText("Test Recipe");

    expect(item).toBeInTheDocument();
});