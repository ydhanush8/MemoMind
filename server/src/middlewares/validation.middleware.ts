import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/** Returns an error message string, or null when the body is valid. */
export type Validator = (body: unknown) => string | null;

export function validate(fn: Validator) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const error = fn(req.body ?? {});
    if (error) {
      res.status(400).json({ error });
      return;
    }
    next();
  };
}

/** Mirrors the original note-route ObjectId guard (400 'Invalid note ID'). */
export function validateObjectId(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid note ID' });
      return;
    }
    next();
  };
}
