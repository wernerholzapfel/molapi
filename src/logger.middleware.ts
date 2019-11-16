import {Injectable, NestMiddleware} from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

        use(req, res, next) {
            next();
        };
}
