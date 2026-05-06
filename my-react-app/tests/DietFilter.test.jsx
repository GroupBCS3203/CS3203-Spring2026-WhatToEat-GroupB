import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DietaryFilter } from "../src/dietaryFilter";
import * as varManager from "../src/varManager";
import { vi, test, expect, describe, beforeEach } from "vitest";


//When the user clicks a dietary filter button, the frontend attempts to save the excluded ingredients.
// User clicks Vegan button -> DietaryFilter component executes ->
// saveExcludedIngredients() -> fetch POST request -> backendAPI

global.fetch = vi.fn();

vi.spyOn(varManager, "getUID").mockReturnValue("12345"); // Mock user ID

describe("DietaryFilter frontend save test", () => { // Tests for DietaryFilter save behavior
  beforeEach(() => {
    fetch.mockClear(); // Clear old fetch called history 
  });

  test("clicking a filter saves excluded ingredients", async () => { // check does clicking the filter trigger saving?
    const mockSetExcludedIngredients = vi.fn(); // lets jest track what is called and what is recieved

    render( // creates a fake test browser
      <DietaryFilter
        excludedIngredients={[]}
        setExcludedIngredients={mockSetExcludedIngredients}
      />
    );

    const veganButton = screen.getByText("Vegan"); // Search page for rendered component for Vegan

    fireEvent.click(veganButton); // Fire event simulates user actions, clicking, typing

    expect(mockSetExcludedIngredients).toHaveBeenCalled(); // Checks if clicking the button updates exclusions

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith( // Check is called with correct arguments
        expect.stringContaining("/api/user/saveDietFilters"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("chicken"),
        })
      );
    });
  });
});
