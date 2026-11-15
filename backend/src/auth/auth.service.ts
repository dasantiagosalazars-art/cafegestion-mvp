import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { appLog, enmascararCorreo } from '../common/app-logger';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  /** Crea la finca y su primer usuario (rol PRODUCTOR). SWR-AUTH-001, SWR-SEC-002. */
  async registrar(dto: RegisterDto) {
    const correo = dto.email.trim().toLowerCase();

    const existente = await this.prisma.usuario.findUnique({
      where: { email: correo },
    });
    if (existente) {
      appLog('WARN', 'AuthService', 'REGISTER_REJECTED', 'Correo ya registrado', {
        correo: enmascararCorreo(correo),
      });
      throw new ConflictException('El correo ya está registrado.');
    }

    // SWR-SEC-002: la contraseña se guarda solo como hash con sal (bcrypt)
    const passwordHash = await hash(dto.password, 10);

    const finca = await this.prisma.finca.create({
      data: {
        nombre: dto.nombreFinca.trim(),
        usuarios: {
          create: {
            email: correo,
            nombre: dto.nombre.trim(),
            passwordHash,
            rol: Rol.PRODUCTOR,
          },
        },
      },
      include: { usuarios: true },
    });

    const usuario = finca.usuarios[0];
    appLog('INFO', 'AuthService', 'USER_REGISTERED', 'Usuario y finca registrados', {
      userId: usuario.id,
      fincaId: finca.id,
    });

    return this.emitirSesion(usuario);
  }

  /** SWR-AUTH-001/002/003: valida credenciales sin revelar cuál dato falló. */
  async iniciarSesion(dto: LoginDto) {
    const correo = dto.email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: correo },
    });

    const passwordValida = usuario
      ? await compare(dto.password, usuario.passwordHash)
      : false;

    if (!usuario || !usuario.activo || !passwordValida) {
      appLog('WARN', 'AuthService', 'LOGIN_FAILED', 'Inicio de sesión fallido', {
        correo: enmascararCorreo(correo),
      });
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    appLog('INFO', 'AuthService', 'LOGIN_OK', 'Inicio de sesión correcto', {
      userId: usuario.id,
      fincaId: usuario.fincaId,
    });

    return this.emitirSesion(usuario);
  }

  async perfil(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { finca: true },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      finca: { id: usuario.finca.id, nombre: usuario.finca.nombre },
    };
  }

  private async emitirSesion(usuario: {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
    fincaId: string;
  }) {
    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
      fincaId: usuario.fincaId,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fincaId: usuario.fincaId,
      },
    };
  }
}
