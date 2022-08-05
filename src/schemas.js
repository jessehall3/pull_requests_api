const yup = require("yup");

module.exports.pullsSchema = yup.array().of(
  yup.object().shape({
    id: yup.number().required(),
    number: yup.number().required(),
    title: yup.string().required(),
    user: yup.object().shape({
      login: yup.string().required(),
    }),
    commits_url: yup.string().url(),
  })
);

module.exports.commitsSchema = yup.array().of(
  yup.array().of(
    yup.object().shape({
      sha: yup.string().required(),
    })
  )
);
