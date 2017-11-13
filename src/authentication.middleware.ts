import {ExpressMiddleware, Middleware, NestMiddleware} from '@nestjs/common';
import * as jwt from 'express-jwt';

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
