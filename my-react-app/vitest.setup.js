import { vi } from "vitest";

// global fetch mock for all tests
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([{ _id: "1", title: "Fake Recipe" }])
    })
);