import mongoose from "mongoose";
import { JsonApiRelationship, JsonApiResource } from "../types/json-api";
import { createJsonApiResponse } from "./route-helper";

export class ResourceHandler {
    constructor(
      private Model: mongoose.Model<any>,
      private type: string,
      private relationshipMap: Record<string, string[]> = {}
    ) {}
  
    async findAll(includes: string[] = []) {
      let query = this.Model.find();
      
      for (const include of includes) {
        if (this.relationshipMap[include]) {
          query = query.populate(include);
        }
      }
  
      const resources = await query.exec();
      return this.serializeCollection(resources, includes);
    }
  
    async findById(id: string, includes: string[] = []) {
      let query = this.Model.findById(id);
      
      for (const include of includes) {
        if (this.relationshipMap[include]) {
          query = query.populate(include);
        }
      }
  
      const resource = await query.exec();
      if (!resource) return null;
      
      return this.serializeResource(resource, includes);
    }
  
    serializeResource(resource: any, includes: string[] = []) {
      const serialized = {
        type: this.type,
        id: resource._id,
        attributes: this.getAttributes(resource),
        relationships: this.getRelationships(resource)
      };
  
      const included = includes.flatMap(include =>  this.relationshipMap[include] &&
        this.serializeIncluded(resource[include], this.relationshipMap[include][0])
      );
  
      return createJsonApiResponse(serialized, included);
    }
  
    private getAttributes(resource: any) {
      // Extract non-relationship fields
      const { _id, __v, ...attributes } = resource.toObject();
      return attributes;
    }
  
    private getRelationships(resource: any) {
      // Build relationships based on relationshipMap
      const relationships: Record<string, JsonApiRelationship> = {};
      
      Object.keys(this.relationshipMap).forEach(key => {
        if (resource[key]) {
          relationships[key] = {
            data: Array.isArray(resource[key])
              ? resource[key].map((item: any) => ({
                  type: this.relationshipMap[key][0],
                  id: item._id
                }))
              : {
                  type: this.relationshipMap[key][0],
                  id: resource[key]._id
                }
          };
        }
      });
  
      return relationships;
    }

    private serializeCollection(resources: any[], includes: string[] = []) {
        const serializedResources = resources.map(resource => ({
          type: this.type,
          id: resource._id,
          attributes: this.getAttributes(resource),
          relationships: this.getRelationships(resource)
        }));
      
        const included = resources.flatMap(resource =>
          includes.flatMap(include =>
            this.serializeIncluded(resource[include], this.relationshipMap[include][0])
          )
        );
      
        return createJsonApiResponse(serializedResources, included);
      }
      
    private serializeIncluded(resources: any | any[], type: string): JsonApiResource[] {
        if (!resources) return [];
        
        const items = Array.isArray(resources) ? resources : [resources];
        
        return items
          .map(item => {
            if (!item || !item._id) return null;
            
            return {
              type,
              id: item._id,
              attributes: this.getAttributes(item),
              relationships: this.getRelationships(item) ?? {}
            };
          })
          .filter((item) => item !== null) as JsonApiResource[];
    }
  }