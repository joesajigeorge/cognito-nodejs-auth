'use strict';
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');

const jwt_val = require('./middleware/jwt-validator'); 

const { poolData, pool_region } = require('./cognito-config');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.get('/api', function (req, res) {
  res.status(200).json({ "status": 1, "message": "API Working" });
});

app.post('/api/signup', function (req, res) {
  var body = req.body;
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:body['email']}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:role",Value:body['role']}));

  userPool.signUp(body['email'], body['password'], attributeList, null, function(err, result){
      if (err) {
          console.log(err);
          return;
      }
      const cognitoUser = result.user;
      console.log('user name is ' + cognitoUser.getUsername());
      res.status(200).json({ "status": 1, "message": "user: "+cognitoUser.getUsername() +" successfully added" });
  });
});

app.post('/api/login', function (req, res) {
  var body = req.body;
  var authenticationData = {
    Username: body['email'],
    Password: body['password'],
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
  );
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
      Username: body['email'],
      Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
          console.log('access token : ' + result.getAccessToken().getJwtToken());
          console.log('id token : ' + result.getIdToken().getJwtToken());
          console.log('refresh token : ' + result.getRefreshToken().getToken());
          console.log('Successfully logged!');
          res.status(200).json({ "status": 1, "message": "user logged in successfully ", "data": result.getIdToken().getJwtToken()});
      },
      onFailure: function(err) {
        res.status(200).json({ "status": 0, "message": "User login failed "+err });
      },
  });
});

app.get('/api/helloworld', jwt_val.default(), function (req, res) {
  console.log("Hello Simulated World");
  res.status(200).json({ "status": 1, "message": "Hello Simulated World" });
});

module.exports.handler = serverless(app);