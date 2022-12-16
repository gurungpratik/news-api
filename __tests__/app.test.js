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
  })

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
  })

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
  })

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
  })

  test("status 400: should return bad request when given comment object has more than two keys", () => {
    const ARTICLE_ID = -1;
    const comment = {
      username: "butter_bridge",
      body: "lorem ipsum",
      extra: "extra"
    };
      return request(app)
        .post(`/api/articles/${ARTICLE_ID}/comments`)
        .send(comment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe(`bad request`);
    });
  })

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
  })
});
