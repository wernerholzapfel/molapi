import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {Aflevering} from './afleveringen/aflevering.entity';
import {getRepository} from 'typeorm';
import {MiddlewareFunction, NestMiddleware} from '@nestjs/common/interfaces/middleware';

@Injectable()
export class QuizMiddleware implements NestMiddleware {
    private readonly logger = new Logger('QuizMiddleware', true);

    async resolve(): Promise<MiddlewareFunction> {
        return (req, res, next) => {
            this.logger.log(req.body.aflevering);

            return getRepository(Aflevering).findOne({aflevering: req.body.aflevering + 1})
                .then(aflevering => {
                    if (aflevering && Date.parse(aflevering.deadlineDatetime.toString()) < Date.now()) {
                        next(new HttpException({
                            error: 'Je kan geen vragen meer beantwoorden voor aflevering ' + aflevering.aflevering + ' de deadline was ' + aflevering.deadlineDatetime,
                            status: HttpStatus.FORBIDDEN,
                        }, HttpStatus.FORBIDDEN));
                    }
                    else next();
                }, err => {
                    next(new HttpException({
                        message: err,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST));
                }).catch(error => {
                    this.logger.log('kan aflevering niet ophalen');
                    this.logger.log('kan aflevering niet ophalen: ' + error);
                    next(new HttpException({
                        error,
                        status: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST));
                });
        };
    }
}