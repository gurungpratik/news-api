const invalidPath = (req, res) => {
    res.status(404).send({message: "path not found"});
}

module.exports = { invalidPath };