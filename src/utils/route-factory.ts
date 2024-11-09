import { Router, Request, Response } from 'express';
import { Model } from 'mongoose';
import { ResourceHandler } from './resource-handlers';
import { parseIncludes } from './route-helper';

interface RouteOptions {
  model: Model<any>;
  type: string;
  relationshipMap: Record<string, string[]>;
}

export function createResourceRouter({ model, type, relationshipMap }: RouteOptions): Router {
  const router = Router();
  const handler = new ResourceHandler(model, type, relationshipMap);

  // GET all
  router.get('/', async (req: Request, res: Response) => {
    const includes = parseIncludes(req);
    const response = await handler.findAll(includes);
    res.json(response);
  });

  // GET by id
  router.get('/:id', async (req: Request, res: Response) => {
    const includes = parseIncludes(req);
    const response = await handler.findById(req.params.id, includes);
    
    if (!response) {
    //   return res.status(404).json({
    //     errors: [{
    //       status: '404',
    //       title: 'Resource not found'
    //     }]
    //   });
    }
    
    res.json(response);
  });

  // POST new
  router.post('/', async (req: Request, res: Response) => {
    const newResource = new model(req.body);
    await newResource.save();
    res.status(201).json({
      data: {
        type,
        id: newResource._id,
        attributes: {
          label: newResource.label
        }
      }
    });
  });

  return router;
}