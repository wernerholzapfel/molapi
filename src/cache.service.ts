import * as NodeCache from 'node-cache';
import {Component} from '@nestjs/common';

const myCache = new NodeCache();

@Component()
export class CacheService {

    constructor( ) {
    }

    async get(key): Promise<any> {
        return myCache.get(key.replace(/^\/|\/$/g, ''));
    }

    async set(key, value): Promise<any> {
        return myCache.set(key.replace(/^\/|\/$/g, ''), value);
    }

    async flushAll(): Promise<any> {
        return myCache.flushAll();
    }
}