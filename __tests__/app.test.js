const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

afterAll(() => db.end());
beforeEach(() => seed(testData));

describe("404 path not found", () => {
  test("should return 404 error for invalid paths", () => {
      return request(app)
        .get("/api/pathnotvalid")
        .expect(404)
        .then(({ body }) => {
          expect(body).toEqual({ message: "path not found" });
        });
    });
});

describe("GET /api/topics", () => {
  test("status 200: should return array containing all topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

