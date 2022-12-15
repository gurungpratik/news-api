const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics.controller");

const {
  getArticles,
  getArticleById,
  getCommentsByArticle,
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

app.all("*", invalidPath);
app.use(psql400Error);
app.use(customError);
app.use(serverError);

module.exports = app;
