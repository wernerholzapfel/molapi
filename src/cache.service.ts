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
        const stats = await myCache.getStats();

        return stats;
    }

    async getKeys(): Promise<string[]> {
        return myCache.keys(keys => keys);
    }

    async flushAll(): Promise<any> {
        return myCache.flushAll();
    }
}