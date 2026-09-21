import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.issues ?? error.errors ?? [{ path: '', message: error.message ?? 'Validation failed' }],
      });
    }
  };
};

export default validateRequest;