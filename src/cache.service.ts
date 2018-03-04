import * as NodeCache from 'node-cache';
import {Component, Logger} from '@nestjs/common';
import {Stats} from 'node-cache';

const myCache = new NodeCache();

@Component()
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
        const stats = await myCache.getStats();
        // this.logger.log('cache keys: ' + stats.keys);
        // this.logger.log('cache ksize: ' + stats.ksize);
        // this.logger.log('cache hits: ' + stats.hits);
        // this.logger.log('cache misses: ' + stats.misses);
        // this.logger.log('cache vsize: ' + stats.vsize);

        return stats;
    }

    async getKeys(): Promise<string[]> {
        return myCache.keys(keys => keys);
    }

    async flushAll(): Promise<any> {
        return myCache.flushAll();
    }
}