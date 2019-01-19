import {BadRequestException, ForbiddenException, Injectable, Logger} from '@nestjs/common';
import {Aflevering} from './afleveringen/aflevering.entity';
import {getRepository} from 'typeorm';
import {MiddlewareFunction, NestMiddleware} from '@nestjs/common/interfaces/middleware';

@Injectable()
export class VoorspellingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('VoorspellingMiddleware', true);

    async resolve(): Promise<MiddlewareFunction> {
        return async (req, res, next) => {
            this.logger.log(req.body.aflevering);

            return await getRepository(Aflevering).findOne({aflevering: req.body.aflevering})
                .then(aflevering => {
                    if (aflevering && Date.parse(aflevering.deadlineDatetime.toString()) < Date.now()) {
                        next(new ForbiddenException('Je kan geen voorspellingen meer opslaan voor aflevering '
                                + aflevering.aflevering + ' de deadline was ' + aflevering.deadlineDatetime));
                    }
                    else next();
                }, err => {
                    next(new BadRequestException());
                });
        };
    }
}
