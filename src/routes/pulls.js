const express = require("express");
const router = express.Router();
const { SUCCESS } = require("../constants.js");
const {
  validateAuthToken,
  getPullsInfo,
  getCommitsInfo,
} = require("../controllers/pull");

router.get(
  "/:owner/:repo",
  validateAuthToken,
  getPullsInfo,
  getCommitsInfo,
  (_req, res) => {
    const { combinedInfo } = res.locals;

    res.status(SUCCESS).json(combinedInfo);
  }
);

module.exports = router;
