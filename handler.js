'use strict';
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.get('/api', function (req, res) {
  res.status(200).json({ "status": 1, "message": "API Working" });
});
module.exports.handler = serverless(app);