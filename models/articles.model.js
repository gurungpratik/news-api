const db = require("../db/connection");

const selectArticles = () => {
  let queryString = `SELECT articles.article_id, articles.author,  articles.title, articles.topic, articles.created_at, articles.votes, COUNT(comments.body) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC;`;
  return db.query(queryString).then((result) => {
    return result.rows;
  });
};

module.exports = { selectArticles };
