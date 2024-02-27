const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

let users = [];

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const userData = {
    username: username,
    _id: uuidv4(),
  };
  users.push(userData);
  res.json(userData);
});

app.get("/api/users", (req, res) => {
  res.send(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;

  const { description, duration, date } = req.body;
  const exerciseData = {
    description: description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };
  const user = users.find((user) => user._id === _id);
  if (user) {
    user.log = user.log || [];
    user.log.push(exerciseData);
    const userData = {
      username: user.username,
      _id: user._id,
    };
    res.json({ ...userData, ...exerciseData });
  } else {
    res.json({ error: "No user found!" });
  }
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  let fromDate = from ? new Date(from) : new Date(0);
  let toDate = to ? new Date(to) : new Date();

  const user = users.find((user) => user._id === _id);
  if (!user) {
    res.json({ error: "User not found" });
    return;
  }

  let logs = user.log || [];
  logs = logs.filter((log) => {
    let logDate = new Date(log.date);
    return logDate >= fromDate && logDate <= toDate;
  });

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
