import * as NodeCache from 'node-cache';
import {Stats} from 'node-cache';
import {Injectable, Logger} from '@nestjs/common';

const myCache = new NodeCache();

@Injectable()
export class CacheService {
    private readonly logger = new Logger('CacheService', true);

    constructor() {
    }

    async get(key): Promise<any> {
        return myCache.get(key.replace(/^\/|\/$/g, ''));
    }

    async set(key, value): Promise<any> {
        return myCache.set(key.replace(/^\/|\/$/g, ''), value);
    }

    async getStats(): Promise<Stats> {
        return await myCache.getStats();
    }

    async flushAll(): Promise<any> {
        return myCache.flushAll();
    }
}
