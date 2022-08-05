const { NOT_FOUND, FORBIDDEN } = require("../constants.js");
const { pullsSchema, commitsSchema } = require("../schemas.js");
const { default: axios } = require("axios");

module.exports.validateAuthToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return next({
      log: "Request missing auth token",
      status: FORBIDDEN,
      message: { error: "authorization token required" },
    });
  }

  const authToken = req.headers.authorization.split(" ")[1];

  const headers = {
    Authorization: `token ${authToken}`,
  };

  res.locals.headers = headers;

  return next();
};

const handleError = (error, next) => {
  let log = "error retrieving pulls data";
  let status = NOT_FOUND;
  let errorMessage = "not found";

  if (error.response) {
    status = error.response.status;

    const { data } = error.response;

    log = data;

    errorMessage = data?.message || "not found";
  } else if (error.request) {
    log = error.request;
  } else {
    log = error.message;
  }

  return next({
    log,
    status,
    message: { error: errorMessage },
  });
};

module.exports.getPullsInfo = async (req, res, next) => {
  const { owner, repo } = req.params;
  const { headers } = res.locals;

  const pullsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;

  try {
    const { data: pullsData } = await axios.get(pullsUrl, {
      headers,
    });

    pullsSchema.validateSync(pullsData);

    const pullsInfo = pullsData.map(({ id, number, title, user }) => {
      return { id, number, title, author: user.login };
    });

    const commitsUrls = pullsData.map(({ commits_url }) => {
      return commits_url;
    });

    res.locals.pullsInfo = pullsInfo;
    res.locals.commitsUrls = commitsUrls;

    return next();
  } catch (error) {
    handleError(error, next);
  }
};

module.exports.getCommitsInfo = async (_req, res, next) => {
  const { headers, pullsInfo, commitsUrls } = res.locals;

  try {
    const commitsGetters = commitsUrls.map((commitsUrl) => {
      return axios.get(commitsUrl, {
        headers,
      });
    });

    const commitsData = (await Promise.all(commitsGetters)).map(
      ({ data }) => data
    );

    commitsSchema.validateSync(commitsData);

    res.locals.combinedInfo = pullsInfo.map((pullInfo, index) => {
      return {
        ...pullInfo,
        commit_count: commitsData[index].length,
      };
    });

    return next();
  } catch (error) {
    handleError(error, next);
  }
};
