import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

// Every error leaves as { "error": "..." }.
@Catch()
export class JsonErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<{ status(code: number): { json(body: unknown): void } }>();
    if (!(exception instanceof HttpException)) {
      Logger.error(exception);
      return res.status(500).json({ error: 'Something went wrong' });
    }
    const body = exception.getResponse();
    const message = typeof body === 'string' ? body : (body as { message?: unknown }).message;
    res
      .status(exception.getStatus())
      .json({ error: Array.isArray(message) ? message.join('; ') : String(message ?? exception.message) });
  }
}
