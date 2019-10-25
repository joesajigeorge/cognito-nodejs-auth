const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const { poolData, pool_region } = require('../cognito-config');
const request = require('request');

exports.default = () => {
    return (req, res, next) => {
        const decodedJwt = jwt.decode(req.headers['authorization'], {complete: true});
        //console.log(decodedJwt);
        if (!decodedJwt) {
            throw new Error('Not a valid JWT Token');
        }
        if (decodedJwt.payload.iss !== 'https://cognito-idp.'+pool_region+'.amazonaws.com/'+poolData.UserPoolId) {
            throw new Error('Invalid issuer: ' + decodedJwt.payload.iss);
        }
        if (!(decodedJwt.payload.token_use === 'id')) {
            throw new Error('Invalid token_use: ' + decodedJwt.payload.token_use);
        }
        if (decodedJwt.payload.aud !== poolData.ClientId) {
            throw new Error('Invalid aud: ' + decodedJwt.payload.aud);
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
                    console.log('Invalid token');
                    context.fail("Unauthorized");
                    return;
                }
                jwt.verify(req.headers['authorization'], pem, function (err, decoded) {
                    if (err) {
                        throw new Error('Validation failed: ', err)
                    }  
                    console.log("JWT Validation passed");
                    next();
                });
            } else {
                throw new Error('JWK json download failed');
            }
        });
        };
    };