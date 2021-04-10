const path = require("path");

const http = require("http");
const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const { workingRoot } = require("./helpers/directories");
const routes = require("./routes");
const healthcheck = require("./healthcheck");
const config = require("config");

const app = express();

const port = config.get("PORT");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static(workingRoot));
app.use("/", routes);

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send("<h1>Server Error</h1>");
});

const server = http.createServer(app);

//healthcheck
healthcheck.setupHealthCheck(server);

server.listen(port);
console.log(`💻  Listening on port ${port}`);
