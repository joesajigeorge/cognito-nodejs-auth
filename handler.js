'use strict';
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
global.fetch = require('node-fetch');

const jwt_val = require('./middleware/jwt-validator'); 

const { poolData } = require('./cognito-config');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.get('/api', function (req, res) {
  res.status(200).json({ "status": 1, "message": "API Working" });
});

app.post('/api/signup', (req, res) => {
  var body = req.body;
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:body['email']}));

  userPool.signUp(body['email'], body['password'], attributeList, null, (err, result) => {
      if (err) {
          return;
      }
      const cognitoUser = result.user;
      console.log('user name is ' + cognitoUser.getUsername());
      res.status(200).json({ "status": 1, "message": "user: "+cognitoUser.getUsername() +" successfully added" });
  });
});

app.post('/api/signin', (req, res) => {
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
      onSuccess: (result) => {
          console.log('access token : ' + result.getAccessToken().getJwtToken());
          console.log('id token : ' + result.getIdToken().getJwtToken());
          console.log('refresh token : ' + result.getRefreshToken().getToken());
          console.log('Successfully logged!');
          res.status(200).json({ "status": 1, "message": "user signed in successfully ", "data": result.getIdToken().getJwtToken()});
      },
      onFailure: (err) => {
        res.status(200).json({ "status": 0, "message": "User sign in failed "+err });
      },
  });
});

app.post('/api/signout', (req, res) => {
  var body = req.body;
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  var params = {
    UserPoolId: poolData['UserPoolId'],
    Username: body['email']
  };
  cognitoIdentityServiceProvider.adminUserGlobalSignOut(params, (err, result) => {
    if (err) {
      res.status(200).json({ "status": 0, "message": "Signout failed" });
    }
    else {
      res.status(200).json({ "status": 1, "message": "User successfully signed out", "data": result });
    }
  });
});

app.post('/api/confirmotp', (req, res) => {
  var body = req.body;
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  var params = {
    ClientId: poolData['ClientId'],
    Username: body['email'],
    ConfirmationCode: body['otp']
  };
  cognitoIdentityServiceProvider.confirmSignUp(params, (err, result) => {
    if (err) {
      res.status(200).json({ "status": 0, "message": "Unable to verify OTP" });
    }
    else {
      res.status(200).json({ "status": 1, "message": "User successfully verified" });
    }
  });
});

app.post('/api/resendotp', (req, res) => {
  var body = req.body;
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  var params = {
    ClientId: poolData['ClientId'],
    Username: body['email']
  };
  cognitoIdentityServiceProvider.resendConfirmationCode(params, (err, result) => {
    if (err) {
      res.status(200).json({ "status": 0, "message": "OTP sent failed" });
    }
    else {
      res.status(200).json({ "status": 1, "message": "OTP send successfully"});
    }
  });
});

app.post('/api/changepassword', (req, res) => {
  var body = req.body;
  // var forceUpdate = body.isForceUpdate;
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: body['email'],
    Password: body['password'],
  });
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Username: body['email'],
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      cognitoUser.changePassword(body['password'], body['newpassword'], (err, result) => {
        if (err) {
          res.status(200).json({ "status": 0, "message": "Password Change Failed" });
        } else {
          res.status(200).json({ "status": 1, "message": "Password changed" });
        }
      });
    },
    onFailure: (err) => {
      res.status(200).json({ "status": 0, "message": "Failed to authenticate" });
    },
  });
});

app.post('/api/forgotpassword', (req, res) => {
  var body = req.body;
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  var params = {
    ClientId: poolData['ClientId'],
    Username: body['email']
  };
  cognitoIdentityServiceProvider.forgotPassword(params, (err, result) => {
    if (err) {
      res.status(200).json({ "status": 0, "message": "Unable to send confirmation code", "data": err });
    }
    else {
      res.status(200).json({ "status": 1, "message": "confirmation code send" });
    }
  });
});

app.post('/api/confirmforgotpassword', (req, res) => {
  var body = req.body;
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  var params = {
    ClientId: poolData['ClientId'],
    Username: body['email'],
    ConfirmationCode: body['otp'],
    Password: body['password']
  };
  cognitoIdentityServiceProvider.confirmForgotPassword(params, (err, result) => {
    if (err) {
      res.status(200).json({ "status": 0, "message": "Unable to verify the OTP", "data": err });
    }
    else {
      res.status(200).json({ "status": 1, "message": "User password changed" });
    }
  });
});

app.get('/api/helloworld', jwt_val.default(), (req, res) => {
  res.status(200).json({ "status": 1, "message": "Hello Simulated World" });
});

module.exports.handler = serverless(app);