const App = require("./app");
const app = App();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});
