const express = require("express");
const app = express();
app.use(express.json());

const { getTopics } = require("./controllers/topics.controller");

const {
  getArticles,
  getArticleById,
  getCommentsByArticle,
  patchArticleById,
  postCommentToArticle
} = require("./controllers/articles.controller");

const {
  invalidPath,
  psql400Error,
  customError,
  serverError,
} = require("./controllers/errors.controller");

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticle);
app.patch("/api/articles/:article_id", patchArticleById);
app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.all("*", invalidPath);
app.use(psql400Error);
app.use(customError);
app.use(serverError);

module.exports = app;
