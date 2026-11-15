import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appLog } from './app-logger';
import { UsuarioToken } from './usuario-token';

interface PeticionAutenticada {
  headers: Record<string, string | string[] | undefined>;
  user?: UsuarioToken;
}

/**
 * SWR-AUTH-002: protege las rutas. Solo deja pasar peticiones con un token
 * válido (Authorization: Bearer <token>) y deja el usuario en req.user.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<PeticionAutenticada>();
    const cabecera = req.headers['authorization'];

    if (typeof cabecera !== 'string' || !cabecera.startsWith('Bearer ')) {
      appLog('WARN', 'JwtAuthGuard', 'ACCESS_WITHOUT_TOKEN', 'Acceso sin token a ruta protegida');
      throw new UnauthorizedException('Debe iniciar sesión para continuar.');
    }

    try {
      req.user = await this.jwt.verifyAsync<UsuarioToken>(cabecera.slice(7));
      return true;
    } catch {
      appLog('WARN', 'JwtAuthGuard', 'TOKEN_INVALID', 'Token inválido o expirado');
      throw new UnauthorizedException('La sesión no es válida o expiró.');
    }
  }
}
