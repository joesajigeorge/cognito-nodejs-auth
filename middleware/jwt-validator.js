const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const { poolData, pool_region } = require('../config/cognito-config');
const request = require('request');

exports.default = () => {
    return (req, res, next) => {
        const decodedJwt = jwt.decode(req.headers['authorization'], {complete: true});
        //console.log(decodedJwt);
        if (!decodedJwt) {
            res.status(200).json({ "status": 0, "message": "Not a valid JWT Token" });
        }
        if (decodedJwt.payload.iss !== 'https://cognito-idp.'+pool_region+'.amazonaws.com/'+poolData.UserPoolId) {
            res.status(200).json({ "status": 0, "message": 'Invalid issuer: ' + decodedJwt.payload.iss });
        }
        if (!(decodedJwt.payload.token_use === 'id')) {
            res.status(200).json({ "status": 0, "message": 'Invalid token_use: ' + decodedJwt.payload.token_use });
        }
        if (decodedJwt.payload.aud !== poolData.ClientId) {
            res.status(200).json({ "status": 0, "message": 'Invalid aud: ' + decodedJwt.payload.aud });
        }
        request({url: 'https://cognito-idp.us-east-1.amazonaws.com/'+poolData.UserPoolId+'/.well-known/jwks.json', json: true}, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                //console.log(body);
                pems = {};
                var keys = body['keys'];
                for(var i = 0; i < keys.length; i++) {
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = { kty: key_type, n: modulus, e: exponent};
                    var pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }
                var kid = decodedJwt.header.kid;
                var pem = pems[kid];
                if (!pem) {
                    //context.fail("Unauthorized");
                    res.status(200).json({ "status": 0, "message": "Invalid token: Unauthorized" });
                    return;
                }
                jwt.verify(req.headers['authorization'], pem, (err, decoded) => {
                    if (err) {
                        res.status(200).json({ "status": 0, "message": "Token validation failed" });
                    }  
                    console.log("JWT Validation passed");
                    next();
                });
            } else {
                res.status(200).json({ "status": 0, "message": "JWK json download failed" });
            }
        });
        };
    };