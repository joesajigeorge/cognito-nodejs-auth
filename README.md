# Cognito NodeJS Authentication

![](https://image-publiclink.s3.amazonaws.com/aws-logo.png)

This project is created to understand cognito authentication.

## prerequisite

Install the npm Packages

    npm install

Update the environment vaiables <USERPOOL_ID>, <CLIENT_ID>, <REGION> in the serverless.yml file.

## Deployment

Deploy the application

    sls deploy

The application will be deployed to the default aws account in the aws configuration. You can also deploy to a particular profile.

    sls --aws-profile < Profile Name > deploy

The application can also be run locally using serverless-offline plugin.

    sls offline

## Reference 
- https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec
- https://www.npmjs.com/package/amazon-cognito-identity-js
- https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/
- https://it.toolbox.com/blogs/ashanfernando/validating-jwt-tokens-from-aws-cognito-user-pools-101918
- http://martint86.github.io/jwt-decode-node/
