const { default: axios } = require("axios");
const request = require("supertest");
const App = require("./app.js");
const { SUCCESS, NOT_FOUND, FORBIDDEN } = require("./constants.js");

jest.mock("axios");

const samplePullsUrl = "https://api.github.com/repos/my-user/my-repo/pulls";

const firstCommitsUrl =
  "https://example.com/repos/my-user/my-repo/pulls/1/commits";

const secondCommitsUrl =
  "https://example.com/repos/my-user/my-repo/pulls/2/commits";

const samplePullsData = [
  {
    id: 1234,
    number: 1,
    title: "My First PR",
    commits_url: firstCommitsUrl,
    user: {
      login: "First-Person",
    },
  },
  {
    id: 5678,
    number: 2,
    title: "My Second PR",
    commits_url: secondCommitsUrl,
    user: {
      login: "Second-Person",
    },
  },
];

const axiosPullsResponse = {
  data: samplePullsData,
};

const sampleCommitsData = [
  {
    sha: "123",
  },
  {
    sha: "456",
  },
];

const axiosCommitsResponse = {
  data: sampleCommitsData,
};

const sampleOutput = [
  {
    id: 1234,
    number: 1,
    author: "First-Person",
    title: "My First PR",
    commit_count: 2,
  },
  {
    id: 5678,
    number: 2,
    author: "Second-Person",
    title: "My Second PR",
    commit_count: 2,
  },
];

const sampleToken = "my-token";

describe("Pull Requests API", () => {
  describe("/pulls/:owner:repo", () => {
    test("GET success", async () => {
      axios.get
        .mockResolvedValueOnce(axiosPullsResponse)
        .mockReturnValue(axiosCommitsResponse);

      const app = App();

      const result = await request(app)
        .get("/pulls/my-user/my-repo")
        .auth(sampleToken)
        .expect(SUCCESS);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        samplePullsUrl,
        expect.anything()
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        firstCommitsUrl,
        expect.anything()
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        secondCommitsUrl,
        expect.anything()
      );

      expect(result.body).toStrictEqual(sampleOutput);
    });

    test("GET no auth token", async () => {
      const app = App();

      await request(app).get("/pulls/my-user/my-repo").expect(FORBIDDEN);
    });

    test("GET bad pull request data", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          bad: "data",
        },
      });

      const app = App();

      await request(app)
        .get("/pulls/my-user/my-repo")
        .auth(sampleToken)
        .expect(NOT_FOUND);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        samplePullsUrl,
        expect.anything()
      );
    });

    test("GET bad commits data", async () => {
      axios.get.mockResolvedValueOnce(axiosPullsResponse).mockReturnValue({
        data: {
          bad: "data",
        },
      });

      const app = App();

      await request(app)
        .get("/pulls/my-user/my-repo")
        .auth(sampleToken)
        .expect(NOT_FOUND);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        samplePullsUrl,
        expect.anything()
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        firstCommitsUrl,
        expect.anything()
      );
    });

    test("GET GitHub returns error", async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            message: "Not Found",
            documentation_url: "http://example.com",
          },
        },
      });

      const app = App();

      const result = await request(app)
        .get("/pulls/my-user/my-repo")
        .auth(sampleToken)
        .expect(NOT_FOUND);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        samplePullsUrl,
        expect.anything()
      );

      expect(result.body).toStrictEqual({ error: "Not Found" });
    });
  });

  test("unkown path", async () => {
    const app = App();

    await request(app).get("/this-path-does-not-exist").expect(NOT_FOUND);
  });
});
