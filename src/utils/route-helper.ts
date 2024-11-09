import { Request as ExpressRequest } from 'express';
import { JsonApiResource } from '../types/json-api';

export interface Request extends ExpressRequest {
    query: {
        include?: string;
    };
}

export function createJsonApiResponse(data: JsonApiResource | JsonApiResource[], included: JsonApiResource[] = []) {
    return {
        data,
        included: included.filter(Boolean)
    };
}

export function parseIncludes(req: Request): string[] {
    return typeof req.query.include === 'string' ? req.query.include.split(',') : [];
}