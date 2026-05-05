const request = require("supertest");
const app = require("../server");
const userManager = require("../userManagement/userManager");

describe("GET /api/user/saveIngredients", () => {
    it("should return fail if UserID is invalid", async () => {
        const res = await request(app).get("/api/user/saveIngredients?userID=${0}&nameList=${\"\"}&amountList=${\"\"}&dateList=${\"\"}");

        expect(res.statusCode).toBe(200);
        expect(res.body == "failure").toBe(true);
    });

    /*it("should return success if UserID is valid", async () => {
        const res = await request(app).get("/api/user/saveIngredients?userID=${0}&nameList=${\"\"}&amountList=${\"\"}&dateList=${\"\"}");

        expect(res.statusCode).toBe(200);
        expect(res.body == "failure").toBe(true);
    });*/

    it("strings should be combined", async () => {
        const res = userManager.zip(["1", ""], ["2", ""], ["3", ""]);
        console.log(res);
        expect(res[0][0] == "1" ).toBe(true);
        expect(res[0][1] == 2 ).toBe(true);
        expect(res[0][2] == "3" ).toBe(true);
    });
});