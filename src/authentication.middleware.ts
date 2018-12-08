import {HttpException, HttpStatus, Injectable, Logger, NestMiddleware} from '@nestjs/common';
import * as jwt from 'express-jwt';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';
import {getRepository} from 'typeorm';
import {Deelnemer} from './deelnemers/deelnemer.entity';
import {expressJwtSecret} from 'jwks-rsa';
import {MiddlewareFunction} from '@nestjs/common/interfaces/middleware';
import * as admin from 'firebase-admin';
import {ManagementClient} from 'auth0';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;
const logger = new Logger('authenticationMiddleware', true);
const management = new ManagementClient({
    domain: auth0Domain,
    token: auth0Token,
});

@Injectable()
export class AddFireBaseUserToRequest implements NestMiddleware {
    private readonly logger = new Logger('AddFireBaseUserToRequest', true);

    resolve(): MiddlewareFunction {
        return (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                admin.auth().verifyIdToken(extractedToken)
                    .then(decodedToken => {
                        const uid = decodedToken.uid;
                        this.logger.log('uid: ' + uid);
                        admin.auth().getUser(uid)
                            .then(userRecord => {
                                // See the UserRecord reference doc for the contents of userRecord.
                                this.logger.log('Successfully fetched user data:', JSON.stringify(userRecord));
                                req.user = userRecord;
                                next();
                            })
                            .catch(error => {
                                this.logger.log('Error fetching user data:', error);
                            });
                    }).catch(error => {
                    this.logger.log('Error verify token:', error);
                });
            }
        };
    }
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    private readonly logger = new Logger('deelnemersController', true);

    resolve(): MiddlewareFunction {
        this.logger.log('AuthenticationMiddleware');
        return jwt({
            secret: expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
            }),
            audience: 'EiV9guRsd4g8R360ifx3nkIhdc1iezQD',
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithm: 'RS256',
        });
    }
}

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
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
                        return res.sendStatus(403).json('Om wijzigingen door te kunnen voeren moet je admin zijn');
                    }
                });
            }
        };
    }
}

@Injectable()
export class IsEmailVerifiedMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
        return (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                logger.log('start decoding IsEmailVerifiedMiddleware');
                const decoded: any = jwt_decode(extractedToken);
                logger.log(decoded.sub);
                admin.auth().verifyIdToken(extractedToken)
                    .then(async user => {
                    req.user = user;
                    if (user.email_verified) next();
                    else {
                        return res.sendStatus(200).json('Om wijzigingen door te kunnen voeren moet je eerst je mail verifieren. Kijk in je mailbox voor meer informatie.');
                    }
                });
            }
        };
    }
}

@Injectable()
export class IsUserAllowedToPostMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
        return async (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                admin.auth().verifyIdToken(extractedToken).then(
                    async userRecord => {
                        await getRepository(Deelnemer).findOne({firebaseIdentifier: userRecord.uid}).then(async deelnemer => {
                                if (deelnemer.id !== req.body.deelnemer.id) {
                                    throw new HttpException({
                                        message: deelnemer.id + ' probeert voorspellingen van ' + req.body.deelnemer.id + ' op te slaan',
                                        statusCode: HttpStatus.FORBIDDEN,
                                    }, HttpStatus.FORBIDDEN);
                                }
                                next();
                            });
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