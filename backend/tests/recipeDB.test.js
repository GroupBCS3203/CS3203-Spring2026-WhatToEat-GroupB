const request = require("supertest");
const app = require("../server");

let server;

beforeAll(() => {
    server = app.listen(0); // start server on random free port
});

afterAll(() => {
    server.close(); // close server so Jest exits
});

describe("GET /api/recipes/top", () => {
    it("should return an array of the top 10 recipes", async () => {
        const res = await request(app).get("/api/recipes/top");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("each recipe should have required fields", async () => {
        const res = await request(app).get("/api/recipes/top");

        const recipe = res.body[0];

        expect(recipe).toHaveProperty("_id");
        expect(recipe).toHaveProperty("title");
        expect(recipe).toHaveProperty("ingredients");
    });
});

describe("GET /api/recipes/one", () => {
    it("should return a single recipe", async () => {
        const res = await request(app).get("/api/recipes/one");

        expect(res.statusCode).toBe(200);
        expect(res.body).not.toBeNull()
    });

    it("each recipe should have required fields", async () => {
        const res = await request(app).get("/api/recipes/one");

        const recipe = res.body;

        expect(recipe).toHaveProperty("title");
        expect(recipe).toHaveProperty("ingredients");
    });
});
