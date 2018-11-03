import {ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import {CacheService} from './cache.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger('CacheInterceptor', true);
    constructor(private readonly cacheService: CacheService) {}

    async intercept(context: ExecutionContext, stream$: Observable<any>): Promise<any> {
        const key = context.switchToHttp().getRequest();
        const value = await this.cacheService.get(key);

        if (value) {
            this.logger.log('cache ' + key + ' has value');
            return Observable.of(value);
        }
        else {
            this.logger.log('cache ' + key + ' has NO value');
            return stream$;
        }
    }
}
