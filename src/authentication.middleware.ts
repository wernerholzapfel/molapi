import {ExpressMiddleware, Logger, Middleware, NestMiddleware} from '@nestjs/common';
import * as jwt from 'express-jwt';
import {ManagementClient} from 'auth0';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;
const logger = new Logger('authenticationMiddleware', true);
const management = new ManagementClient({
    domain: auth0Domain,
    token: auth0Token,
});

@Middleware()
export class AuthenticationMiddleware implements NestMiddleware {
    resolve(): ExpressMiddleware {
        return jwt({
            secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
            audience: process.env.AUTH0_CLIENT_ID,
            issuer: 'https://werner.eu.auth0.com/',
            algorithm: 'HS256',
        });
    }
}

@Middleware()
export class AdminMiddleware implements NestMiddleware {
    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                // this.logger.log('start decoding');
                const decoded: any = jwt_decode(extractedToken);
                // this.logger.log(decoded.sub);
                management.getUser({
                    id: decoded.sub,
                }).then(async user => {
                    if (user.app_metadata && user.app_metadata.hasOwnProperty('admin')){
                        next();
                    }
                    else {
                        logger.log('ik zit in de else');
                        return res.status(403).json('Om wijzigingen door te kunnen voeren moet je admin zijn');
                    }
                });
            }
        };
    }
}

const getToken = headers => {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};