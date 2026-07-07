import type { Request, Response } from 'express';
import mongoose from 'mongoose';

export function health(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
