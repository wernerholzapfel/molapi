import {HttpStatus, Logger, Middleware} from '@nestjs/common';
import {ExpressMiddleware, NestMiddleware} from '@nestjs/common/interfaces/middlewares';
import {HttpException} from '@nestjs/core';
import {Aflevering} from './afleveringen/aflevering.entity';
import {getRepository} from 'typeorm';

@Middleware()
export class VoorspellingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('VoorspellingMiddleware', true);

    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            this.logger.log(req.body.aflevering);

            return getRepository(Aflevering).findOne({aflevering: req.body.aflevering})
                .then(aflevering => {
                    if (aflevering && Date.parse(aflevering.deadlineDatetime.toString()) < Date.now()) {
                        throw new HttpException({
                            message: 'Je kan geen voorspellingen meer opslaan voor ' + aflevering.aflevering + ' de deadline was ' + aflevering.deadlineDatetime,
                            statusCode: HttpStatus.FORBIDDEN,
                        }, HttpStatus.FORBIDDEN);
                    }
                    else next();
                }, err => {
                    throw new HttpException({
                        message: err,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        };
    }
}