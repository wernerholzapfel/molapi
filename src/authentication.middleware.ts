import {ExpressMiddleware, HttpStatus, Logger, Middleware, NestMiddleware} from '@nestjs/common';
import * as jwt from 'express-jwt';
import {ManagementClient} from 'auth0';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';
import {getRepository} from 'typeorm';
import {Deelnemer} from './deelnemers/deelnemer.entity';
import {HttpException} from '@nestjs/core';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;
const logger = new Logger('authenticationMiddleware', true);
const management = new ManagementClient({
    domain: auth0Domain,
    token: auth0Token,
});

@Middleware()
export class AuthenticationMiddleware implements NestMiddleware {
    private readonly logger = new Logger('deelnemersController', true);
    resolve(): ExpressMiddleware {
        this.logger.log('AuthenticationMiddleware');
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
                const decoded: any = jwt_decode(extractedToken);
                management.getUser({
                    id: decoded.sub,
                }).then(async user => {
                    if (user.app_metadata && user.app_metadata.hasOwnProperty('admin')) {
                        next();
                    }
                    else {
                        return res.status(403).json('Om wijzigingen door te kunnen voeren moet je admin zijn');
                    }
                });
            }
        };
    }
}

@Middleware()
export class IsEmailVerifiedMiddleware implements NestMiddleware {
    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                logger.log('start decoding');
                const decoded: any = jwt_decode(extractedToken);
                logger.log(decoded.sub);
                management.getUser({
                    id: decoded.sub,
                }).then(async user => {
                    if (user.email_verified) next();
                    else {
                        return res.status(200).json('Om wijzigingen door te kunnen voeren moet je eerst je mail verifieren. Kijk in je mailbox voor meer informatie.');
                    }
                });
            }
        };
    }
}

@Middleware()
export class IsUserAllowedToPostMiddleware implements NestMiddleware {
    resolve(): ExpressMiddleware {
        return async (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                logger.log('start decoding');
                const decoded: any = jwt_decode(extractedToken);
                logger.log(decoded.sub);
                const user = await management.getUser({
                    id: decoded.sub,
                });
                await getRepository(Deelnemer).findOne({auth0Identifier: user.user_id}).then( async deelnemer => {
                    if (deelnemer.id !== req.body.deelnemer.id){
                                throw new HttpException({message: deelnemer.id + ' probeert voorspellingen van ' + req.body.deelnemer.id + ' op te slaan', statusCode: HttpStatus.FORBIDDEN}, HttpStatus.FORBIDDEN);
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