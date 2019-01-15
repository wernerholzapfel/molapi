import {HttpException, HttpStatus, Injectable, Logger, NestMiddleware} from '@nestjs/common';
import 'dotenv/config';
import {getRepository} from 'typeorm';
import {Deelnemer} from './deelnemers/deelnemer.entity';
import {MiddlewareFunction} from '@nestjs/common/interfaces/middleware';
import * as admin from 'firebase-admin';

const logger = new Logger('authenticationMiddleware', true);

@Injectable()
export class AddFireBaseUserToRequest implements NestMiddleware {
    private readonly logger = new Logger('AddFireBaseUserToRequest', true);

    async resolve(): Promise<MiddlewareFunction> {
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
                                this.logger.log('Error fetching user data:', uid);
                                next(new HttpException({
                                    status: HttpStatus.FORBIDDEN,
                                    error: 'Could not fetch userdata',
                                }, HttpStatus.FORBIDDEN));
                            });
                    }).catch(error => {
                    this.logger.log('Error verify token:', error);
                    next(new HttpException({
                        status: HttpStatus.FORBIDDEN,
                        error: 'Could not fetch userdata',
                    }, HttpStatus.FORBIDDEN));
                });
            } else {
                next(new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    error: 'We konden je niet verifieren, log opnieuw in.',
                }, HttpStatus.UNAUTHORIZED));
            }
        };
    }
}

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    private readonly logger = new Logger('AdminMiddleware', true);

    async resolve(): Promise<MiddlewareFunction> {
        return (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                admin.auth().verifyIdToken(extractedToken).then((claims) => {
                    if (claims.admin === true) {
                        this.logger.log('ik ben admin');
                        next();
                    }
                    else {
                        next(new HttpException({
                            status: HttpStatus.FORBIDDEN,
                            error: 'Om wijzigingen door te kunnen voeren moet je admin zijn',
                        }, HttpStatus.FORBIDDEN));
                    }
                });
            } else {
                next(new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    error: 'We konden je niet verifieren, log opnieuw in.',
                }, HttpStatus.UNAUTHORIZED));
            }
        };
    }
}

@Injectable()
export class IsUserAllowedToPostMiddleware implements NestMiddleware {
    private readonly logger = new Logger('IsUserAllowedToPostMiddleware', true);

    async resolve(): Promise<MiddlewareFunction> {
        return async (req, res, next) => {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                this.logger.log('dit is de extracted token in IsUserAllowedToPostMiddleware: ' + extractedToken);
                admin.auth().verifyIdToken(extractedToken)
                    .then(async userRecord => {
                        await getRepository(Deelnemer).findOne({firebaseIdentifier: userRecord.uid})
                            .then(async deelnemer => {
                                if (req && req.body && req.body.deelnemer && deelnemer.id !== req.body.deelnemer.id) {
                                    next(new HttpException({
                                        status: HttpStatus.FORBIDDEN,
                                        error: deelnemer.id + ' probeert voorspellingen van ' + req.body.deelnemer.id + ' op te slaan',
                                    }, HttpStatus.FORBIDDEN));
                                }
                                next();
                            });
                    })
                    .catch(error => {
                    this.logger.log('kan deelnemer niet verifieren ' + extractedToken);
                    next(new HttpException({
                        status: HttpStatus.FORBIDDEN,
                        error: 'kan deelnemer niet verifieren',
                    }, HttpStatus.FORBIDDEN));
                });
            } else {
                this.logger.log('geen extracted token');
                next(new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    error: 'Kan deelnemer niet verifieren, log op nieuw in.',
                }, HttpStatus.UNAUTHORIZED));
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