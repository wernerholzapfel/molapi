import {ForbiddenException, Injectable, Logger, NestMiddleware, UnauthorizedException} from '@nestjs/common';
import 'dotenv/config';
import {getRepository} from 'typeorm';
import {Deelnemer} from './deelnemers/deelnemer.entity';
import * as admin from 'firebase-admin';

const logger = new Logger('authenticationMiddleware', true);

@Injectable()
export class AddFireBaseUserToRequest implements NestMiddleware {
    private readonly logger = new Logger('AddFireBaseUserToRequest', true);

    async use(req, res, next) {
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
                                next(new ForbiddenException('Could not fetch userdata'));
                            });
                    }).catch(error => {
                    this.logger.log('Error verify token:', error);
                    next(new ForbiddenException('Could not fetch userdata'));
                });
            } else {
                next(new UnauthorizedException(
                    'We konden je niet verifieren, log opnieuw in.'));
            }
        }
}

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    private readonly logger = new Logger('AdminMiddleware', true);

    async use(req, res, next) {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                admin.auth().verifyIdToken(extractedToken).then((claims) => {
                    if (claims.admin === true) {
                        this.logger.log('ik ben admin');
                        next();
                    }
                    else {
                        next(new ForbiddenException('Om wijzigingen door te kunnen voeren moet je admin zijn'));
                    }
                });
            } else {
                next(new UnauthorizedException('We konden je niet verifieren, log opnieuw in.'));
            }
    }
}

@Injectable()
export class IsUserAllowedToPostMiddleware implements NestMiddleware {
    private readonly logger = new Logger('IsUserAllowedToPostMiddleware', true);

    async use(req, res, next) {
            const extractedToken = getToken(req.headers);
            if (extractedToken) {
                this.logger.log('dit is de extracted token in IsUserAllowedToPostMiddleware: ' + extractedToken);
                admin.auth().verifyIdToken(extractedToken)
                    .then(async userRecord => {
                        await getRepository(Deelnemer).findOne({firebaseIdentifier: userRecord.uid})
                            .then(async deelnemer => {
                                if (req && req.body && req.body.deelnemer && deelnemer.id !== req.body.deelnemer.id) {
                                    next(new ForbiddenException(deelnemer.id + ' probeert voorspellingen van ' + req.body.deelnemer.id + ' op te slaan'));
                                }
                                next();
                            });
                    })
                    .catch(error => {
                        this.logger.log('kan deelnemer niet verifieren ' + extractedToken);
                        next(new ForbiddenException('kan deelnemer niet verifieren'));
                    });
            } else {
                this.logger.log('geen extracted token');
                next(new UnauthorizedException('Kan deelnemer niet verifieren, log op nieuw in.'));
            }
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
