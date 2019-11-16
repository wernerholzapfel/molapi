import {ExecutionContext, Injectable, Logger, NestInterceptor, CallHandler} from '@nestjs/common';
import {CacheService} from './cache.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger('CacheInterceptor', true);
    constructor(private readonly cacheService: CacheService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const key = request.originalUrl;
        const value = this.cacheService.get(key);

        if (value) {
            this.logger.log('cache ' + key + ' has value');
            return of(value);
        }
        else {
            this.logger.log('cache ' + key + ' has NO value');
            return next.handle().pipe(map(data => ({ data })));
        }
    }
}
