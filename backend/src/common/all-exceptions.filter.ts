import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { appLog } from './app-logger';

interface RespuestaHttp {
  status(codigo: number): { json(cuerpo: unknown): void };
}

interface PeticionHttp {
  method: string;
  url: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<RespuestaHttp>();
    const req = ctx.getRequest<PeticionHttp>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const cuerpo = exception.getResponse();

      appLog(
        status >= 500 ? 'ERROR' : 'WARN',
        'HttpExceptionFilter',
        'REQUEST_REJECTED',
        `${req.method} ${req.url} respondió ${status}`,
        { status, method: req.method, path: req.url },
      );

      res
        .status(status)
        .json(
          typeof cuerpo === 'string'
            ? { statusCode: status, message: cuerpo }
            : cuerpo,
        );
      return;
    }

    appLog(
      'ERROR',
      'HttpExceptionFilter',
      'UNHANDLED_EXCEPTION',
      exception instanceof Error ? exception.message : 'Error desconocido',
      { method: req.method, path: req.url },
    );

    res
      .status(500)
      .json({ statusCode: 500, message: 'Error interno del servidor.' });
  }
}
