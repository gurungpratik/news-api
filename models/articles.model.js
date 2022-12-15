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

const selectArticleById = (article_id) => {
  if (parseInt(article_id) < 1) {
    return Promise.reject({
      status: 400,
      msg: "bad request",
    });
  }

  return db.query(`SELECT * FROM articles where article_id = $1; `, [article_id]).then(({rows, rowCount}) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `article ${article_id} does not exist`
      })
    }
    return rows[0];
  })
}

module.exports = { selectArticles, selectArticleById };