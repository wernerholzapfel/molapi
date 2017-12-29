import {ExecutionContext, Interceptor, Logger, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {CacheService} from './cache.service';

@Interceptor()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger('CacheInterceptor', true);
    constructor(private readonly cacheService: CacheService) {}

    async intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Promise<any> {
        const key = dataOrRequest.originalUrl;
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