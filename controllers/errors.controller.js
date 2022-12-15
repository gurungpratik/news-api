const invalidPath = (req, res) => {
  res.status(404).send({ msg: "path not found" });
};

const psql400Error = (err, req, res, next) => {
  if (err.code) {
    res.status(400).send({ msg: "bad request" });
  } else next(err);
};

const customError = (err, req, res, next) => {
  if (err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

const serverError = (err, req, res) => {
  console.log(err);
  res.status(500).send({ msg: "internal server error" });
};

module.exports = { invalidPath, psql400Error, customError, serverError };
