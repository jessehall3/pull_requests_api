# Pull Request API

## Purpose

This is a toy API demonstrating how to build functionality around [GitHub's REST API](https://developer.github.com/v3) (v3). It retrieves data on pull requests for a specified repository.

## Before You Start

A GitHub authorization token is required to use this API. Additionally, the token must have read privileges for the specified repository. All valid tokens will be able to read public repositories.

### Setup

To run this code, please have [Node.js](http://nodejs.org), already installed. Be sure to have version 16 or higher. Next:

- From the root of this repo, run `npm install` to install the appropriate packages.

- Use `npm start` to run start the live API server on port 3000.

- Use `npm run dev` to run the API server in development mode. The server will watch the `src/` directory and restart with any changes.

- Use `npm test` to run all the tests. All tests can be found within the file `src/app.test.js`.

---

### API Documentation

#### Get Information On Pull Requests

##### Request

`GET /pulls/:owner/:repo`

```sh
curl \
  -H "Authorization: token your-auth-token" \
  localhost:3000/pulls/my-user/my-repo
```

##### Response

`Status: 200 OK` \
`Content-Type: application/json`

```json
[
  {
    "id": 1234,
    "number": 1,
    "title": "My First PR",
    "author": "First-Person",
    "commit_count": 2
  },
  {
    "id": 5678,
    "number": 2,
    "title": "My Second PR",
    "author": "Second-Person",
    "commit_count": 2
  }
]
```
