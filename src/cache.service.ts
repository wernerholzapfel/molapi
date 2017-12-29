import * as NodeCache from 'node-cache';
import {Component} from '@nestjs/common';

const myCache = new NodeCache();

@Component()
export class CacheService {

    constructor( ) {
    }

    async get(key): Promise<any> {
        return myCache.get(key);
    }

    async set(key, value): Promise<any> {
        return myCache.set(key, value);
    }

    async flushAll(): Promise<any> {
        return myCache.flushAll();
    }
}