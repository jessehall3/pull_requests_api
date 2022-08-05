const express = require("express");
const { NOT_FOUND, SERVER_ERROR } = require("./constants.js");
const pullsRouter = require("./routes/pulls.js");

function App() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/pulls", pullsRouter);

  //  Handle all unknown request
  app.use("*", (_req, res) => {
    return res.status(NOT_FOUND).send("Not Found");
  });

  //  Global Error Handler
  app.use((error, _req, res, _next) => {
    const defaultError = {
      log: "Express error handler caught unknown middleware error",
      status: SERVER_ERROR,
      message: { error: "An error occurred" },
    };
    const errorObj = { ...defaultError, ...error };
    console.error(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  });

  return app;
}

module.exports = App;
