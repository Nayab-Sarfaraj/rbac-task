import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      })) as any;
      
      // Update request properties with parsed/validated data
      req.body = parsed.body;
      
      if (parsed.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, parsed.params);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
