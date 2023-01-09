const db = require("../db/connection");

const selectArticles = async (
  topic,
  sort_by = "created_at",
  order = "desc"
) => {
  if (topic) {
    const query1 = `SELECT * FROM topics WHERE slug = $1`;
    const { rowCount } = await db.query(query1, [topic])
    if (rowCount === 0) {
      return Promise.reject({ status: 404, msg: `${topic} does not exist` });
    }
  }

  const sortByQueries = [
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  if (!sortByQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  const orderQueries = ["asc", "desc"];
  if (!orderQueries.includes(order)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  let topicQuery = [];
  let queryString = `SELECT articles.article_id, articles.author,  articles.title, articles.topic, articles.created_at, articles.votes, COUNT(comments.body) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id `;

  if (topic !== undefined) {
    queryString += `WHERE articles.topic = $1`;
    topicQuery.push(topic);
  }

  queryString += `GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order};`;

  return db.query(queryString, topicQuery).then((result) => {
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

  return db
    .query(`SELECT * FROM articles where article_id = $1; `, [article_id])
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `article ${article_id} does not exist`,
        });
      }
      return rows[0];
    });
};

const selectCommentsByArticle = (article_id) => {
  if (parseInt(article_id) < 1) {
    return Promise.reject({
      status: 400,
      msg: "bad request",
    });
  }

  return db
    .query(
      `SELECT comment_id, votes, created_at, author, body FROM comments where article_id = $1 ORDER BY created_at DESC; `,
      [article_id]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return db
          .query(`SELECT article_id FROM articles WHERE article_id = $1`, [
            article_id,
          ])
          .then(({ rowCount }) => {
            if (rowCount === 0) {
              return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
              });
            }
            return [];
          });
      }
      return rows;
    });
};

const insertArticleComment = async (article_id, comment) => {
  const { username, body } = comment;

  if (!username || !body || parseInt(article_id) < 1) {
    return Promise.reject({
      status: 400,
      msg: "bad request",
    });
  }

  const query1 = `SELECT * FROM articles WHERE article_id = $1;`;
  const result1 = await db.query(query1, [article_id]);
  if (result1.rowCount === 0) {
    return Promise.reject({
      status: 404,
      msg: `article ${article_id} does not exist`,
    });
  }

  const query2 = `SELECT * FROM users WHERE username = $1;`;
  const result2 = await db.query(query2, [username]);
  if (result2.rowCount === 0) {
    return Promise.reject({
      status: 404,
      msg: `username ${username} does not exist`,
    });
  }

  const query3 = `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`;
  return db.query(query3, [article_id, username, body]).then(({ rows }) => {
    return rows[0];
  });
};

const updateArticleById = (article_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: `bad request`,
    });
  }
  const query = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING*;`;

  return db.query(query, [inc_votes, article_id]).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `article does not exist`,
      });
    }
    return rows[0];
  });
};

module.exports = {
  selectArticles,
  selectArticleById,
  selectCommentsByArticle,
  insertArticleComment,
  updateArticleById,
};
