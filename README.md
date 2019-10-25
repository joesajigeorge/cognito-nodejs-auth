# cognito-nodejs

This project is created to understand cognito authentication.

# prerequisite

Create a file cognito-config.js in the root of the project and add the following data.

        exports.poolData = {    
            UserPoolId : "", // Your user pool id here    
            ClientId : "" // Your client id here
            }; 
        exports.pool_region = ''; //AWS region

# Reference 
https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec
https://www.npmjs.com/package/amazon-cognito-identity-js
https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/
https://it.toolbox.com/blogs/ashanfernando/validating-jwt-tokens-from-aws-cognito-user-pools-101918
http://martint86.github.io/jwt-decode-node/