import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../models/auth.model';
import { ApiError } from '../utils/api-error';

export interface RequestAutenticado extends Request {
    usuario?: JwtPayload;
}

export function verificarToken(
    req: RequestAutenticado,
    _res: Response,
    next: NextFunction
): void {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
        throw new ApiError(401, 'No se proporciono un token de acceso.');
    }

    const token = encabezado.split(' ')[1];

    try {
        const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
        req.usuario = payload;
        next();
    } catch {
        throw new ApiError(401, 'El token es invalido o ha expirado.');
    }
}
