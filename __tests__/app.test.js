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
        expect(body).toEqual({ msg: "path not found" });
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

describe("GET /api/articles", () => {
  test("status 200: should return array of articles with each object containing keys of author, title, article_id, topic, created_at, votes, comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Object);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });

  test("status 200: should return articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("status 200: should return the article corresponding to the article id", () => {
    const ARTICLE_ID = 1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}`)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
  });

  test("status 404: article id is valid format but does not exist", () => {
    const ARTICLE_ID = 1000;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article 1000 does not exist");
      });
  });

  test("status 400: should return error message when article_id is of an incorrect data type (string)", () => {
    const ARTICLE_ID = "one";
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 400: should return error message when article_id is of an incorrect data type (negative int)", () => {
    const ARTICLE_ID = -1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("status 200: should return the comments for the given article id", () => {
    const ARTICLE_ID = 1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });

  test("status 200: should return comments sorted by created_at in descending order", () => {
    const ARTICLE_ID = 1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("status 200: should return an empty array when given an article that exists but has no comments", () => {
    const ARTICLE_ID = 12;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });

  test("status 404: article id is valid format but does not exist", () => {
    const ARTICLE_ID = 1000;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article 1000 does not exist");
      });
  });

  test("status 400: should return error message when article_id is of an incorrect data type (string)", () => {
    const ARTICLE_ID = "one";
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 400: should return error message when article_id is of an incorrect data type (negative int)", () => {
    const ARTICLE_ID = -1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status 200: should return the updated article", () => {
    const ARTICLE_ID = 1;
    const update = { inc_votes: 5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
  });

  test("status 200: increases articles votes by the given inc_votes", () => {
    const ARTICLE_ID = 1;
    const update = { inc_votes: 5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: 105,
          })
        );
      });
  });
  test("status 200: decreases articles votes by the given inc_votes", () => {
    const ARTICLE_ID = 1;
    const update = { inc_votes: -5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: 95,
          })
        );
      });
  });

  test("status 400: request object body does not contain the inc_vote key", () => {
    const ARTICLE_ID = 1;
    const update = { not_inc: 5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 400: request object body is empty", () => {
    const ARTICLE_ID = 1;
    const update = {};
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 404: article_id is valid format but does not exist", () => {
    const ARTICLE_ID = 1000;
    const update = { inc_votes: 5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article does not exist");
      });
  });

  test("status 400: given article_id is incorrect data type (string)", () => {
    const ARTICLE_ID = "one";
    const update = { inc_votes: 5 };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 400: given inc_votes is incorrect data type (string)", () => {
    const ARTICLE_ID = 1;
    const update = { inc_votes: "five" };
    return request(app)
      .patch(`/api/articles/${ARTICLE_ID}`)
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
