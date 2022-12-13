const express = require("express");
const app = express();

const { getTopics } = require("../be-nc-news/controllers/topics.controller");

const { getArticles } = require("../be-nc-news/controllers/articles.controller")

const { invalidPath } = require("../be-nc-news/controllers/errors.controller");




app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);

app.all("*", invalidPath);

module.exports = app;