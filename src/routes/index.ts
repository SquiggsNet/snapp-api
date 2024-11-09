import { Router } from 'express';
import { createResourceRouter } from '../utils/route-factory';
import { resourceConfigs } from '../config/resource-config';

const router = Router();

// Automatically create and mount all resource routers
Object.entries(resourceConfigs).forEach(([path, config]) => {
  router.use(`/${path}s`, createResourceRouter(config));
});

export default router;