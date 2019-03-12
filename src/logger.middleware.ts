import {Injectable, NestMiddleware} from '@nestjs/common';
import {MiddlewareFunction} from '@nestjs/common/interfaces/middleware';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    resolve(...args: any[]): MiddlewareFunction {
        return (req, res, next) => {
            next();
        };
    }
}