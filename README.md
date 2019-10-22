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