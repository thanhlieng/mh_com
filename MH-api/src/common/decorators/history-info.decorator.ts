import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';

export const GetHistory = createParamDecorator(
  (_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const updatedBy = req.user?.id || getUserIdByReq(req);

    return {
      updatedBy,
      path: req.originalUrl || req.url,
      ip: req?.host || req?.ip || '',
      method: req?.method || '',
    };
  },
);

function getUserIdByReq(req: Request) {
  const accessToken = req.get('Authorization')?.replace('Bearer', '').trim();
  const decoded: any = decode(accessToken, { complete: true });
  return decoded.payload?.id;
}