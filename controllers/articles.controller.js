const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticle,
  updateArticleById,
  insertArticleComment,
} = require("../models/articles.model");

const getArticles = (req, res, next) => {
  const  { topic, sort_by, order} = req.query;

  selectArticles(topic, sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticle(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const postCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  insertArticleComment(article_id, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
          })
    .catch((err) => {
      next(err);
    });
};

const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getArticles,
  getArticleById,
  getCommentsByArticle,
  postCommentToArticle,
  patchArticleById,
};
