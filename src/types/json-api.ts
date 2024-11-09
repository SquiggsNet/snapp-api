export interface JsonApiRelationship {
    data: {
        type: string;
        id: string;
    } | {
        type: string;
        id: string;
    }[];
}

export interface JsonApiResource {
    type: string;
    id: string;
    attributes: Record<string, unknown>;
    relationships?: Record<string, JsonApiRelationship>;
}
