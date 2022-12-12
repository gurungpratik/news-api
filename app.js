const express = require("express");
const app = express();

const { getTopics } = require("../be-nc-news/controllers/topics.controller");

const { invalidPath } = require("../be-nc-news/controllers/errors.controller");


app.get("/api/topics", getTopics);
app.all("*", invalidPath);

module.exports = app;