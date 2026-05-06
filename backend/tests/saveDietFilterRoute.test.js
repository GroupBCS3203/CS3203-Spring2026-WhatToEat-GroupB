const request = require("supertest");
const app = require("../server");
const userManager = require("../userManagement/userManager");
const dataManager = require("../userManagement/dataManager");

// Testing call in server.js
// Simulates a frontend request and checks if backend works correctly

jest.mock("../userManagement/dataManager"); // Replaces all REAL data with mock data

describe("POST /api/user/saveDietFilters", () => {
  test("should save diet filters and return success", async () => { // Tests to see if saving works correctly
      dataManager.saveDietFilters.mockResolvedValue("success"); // Creates a fake saveDietFilters()

    const response = await request(app) 
      .post("/api/user/saveDietFilters")
      .send({ // Frontend JSON data
        userID: "12345",
        dietFilters: ["milk", "peanuts"]
      });
    // Check if express returned, if request succeeded, return success
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("success");

    expect(dataManager.saveDietFilters).toHaveBeenCalledWith( // Verifies if route correctly calls saveDietFilters
      "12345",
      ["milk", "peanuts"]
    );
  });

  test("should return failed if saveDietFilters fails", async () => {
      dataManager.saveDietFilters.mockResolvedValue("failed");

    const response = await request(app)
      .post("/api/user/saveDietFilters") // Simulates invalid user data
      .send({
        userID: "badID",
        dietFilters: ["gluten"]
      });
    
    // Check if express returned, even if request completes logic could be invalid
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("failed");
  });
});
