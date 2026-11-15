import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioToken } from './usuario-token';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    const req = ctx.switchToHttp().getRequest<{ user: UsuarioToken }>();
    return req.user;
  },
);
