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
        expect(articles).toBeInstanceOf(Array);
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

  test("status 200: should return articles sorted by date in descending order when sort_by query is not provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("status 200: should return filtered array of articles for the specified topic query when given a valid topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(1);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: "cats",
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });

  test("status 200: should return articles sorted_by the specified sort_by query with order set to descending by default when given a valid query", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });

  test("status 200: should sort the articles by ascending order when given an order query of desc", () => {
    return request(app)
      .get("/api/articles?order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("status 200: should sort the articles by ascending order when given an order_by query of asc", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });

  test("status 200: should return the relevant articles when given three valid queries for topic, sort_by and order", () => {
    return request(app)
      .get("/api/articles?topic=cats&sort_by=title&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(1);
        expect(articles).toBeSortedBy("title");
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: "cats",
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });

  test("status 404: should return topic_name does not exist when given an invalid topic query", () => {
    return request(app)
      .get("/api/articles?topic=invalidtopic")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalidtopic does not exist");
      });
  });

  test("status 400: should return bad request when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("status 400: should return bad request when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
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

describe("POST /api/articles/:article_id/comments", () => {
  test("status 201: should return the comment when posting a new comment", () => {
    const ARTICLE_ID = 1;
    const comment = {
      username: "butter_bridge",
      body: "lorem ipsum",
    };

    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });

  test("status 201: should insert the given comment into the comments table", () => {
    const ARTICLE_ID = 2;
    const comment = {
      username: "butter_bridge",
      body: "lorem ipsum2",
    };

    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(201)
      .then(() => {
        return db
          .query(
            `SELECT * FROM comments
          WHERE comment_id = 19`
          )
          .then(({ rows }) => {
            expect(rows[0]).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                body: expect.any(String),
                article_id: expect.any(Number),
                author: expect.any(String),
                votes: expect.any(Number),
                created_at: expect.any(Date),
              })
            );
          });
      });
  });

  test("status 404: should return article not found when given a valid format article_id that does not exist", () => {
    const ARTICLE_ID = 1000;
    const comment = {
      username: "butter_bridge",
      body: "lorem ipsum2",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(404)
      .send(comment)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`article ${ARTICLE_ID} does not exist`);
      });
  });

  test("status 400: should return bad request when given comment is missing username or body", () => {
    const ARTICLE_ID = 1;
    const comment = {
      username: "butter_bridge",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`bad request`);
      });
  });

  test("status 400: should return bad request when article_id of invalid data type (string)", () => {
    const ARTICLE_ID = "one";
    const comment = {
      username: "butter_bridge",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`bad request`);
      });
  });

  test("status 400: should return bad request when article_id of invalid data type (negative int)", () => {
    const ARTICLE_ID = -1;
    const comment = {
      username: "butter_bridge",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`bad request`);
      });
  });

  test("status 400: should return bad request when given comment object has more than two keys", () => {
    const ARTICLE_ID = -1;
    const comment = {
      username: "butter_bridge",
      body: "lorem ipsum",
      extra: "extra",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`bad request`);
      });
  });

  test("status 404: should return not found when given comment contains a username that does not exist", () => {
    const ARTICLE_ID = 1;
    const comment = {
      username: "nonExistent",
      body: "lorem ipsum",
    };
    return request(app)
      .post(`/api/articles/${ARTICLE_ID}/comments`)
      .send(comment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`username ${comment.username} does not exist`);
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

describe("GET /api/users", () => {
  test("status 200: should return array containing all user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});
