import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Kirim response sukses
export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode: number = 200
): FastifyReply => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return reply.status(statusCode).send(response);
};

// Kirim response created (201)
export const sendCreated = <T>(
  reply: FastifyReply,
  data: T,
  message: string = 'Berhasil dibuat'
): FastifyReply => {
  return sendSuccess(reply, data, message, 201);
};

// Kirim response dengan pagination
export const sendPaginated = <T>(
  reply: FastifyReply,
  data: T[],
  page: number,
  limit: number,
  total: number
): FastifyReply => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return reply.status(200).send(response);
};

// Kirim response error
export const sendError = (
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): FastifyReply => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return reply.status(statusCode).send(response);
};

// Response error umum
export const errors = {
  // Tidak terautentikasi
  unauthorized: (reply: FastifyReply, message: string = 'Tidak terautentikasi') =>
    sendError(reply, 'UNAUTHORIZED', message, 401),

  // Tidak diizinkan
  forbidden: (reply: FastifyReply, message: string = 'Akses ditolak') =>
    sendError(reply, 'FORBIDDEN', message, 403),

  // Tidak ditemukan
  notFound: (reply: FastifyReply, resource: string = 'Resource') =>
    sendError(reply, 'NOT_FOUND', `${resource} tidak ditemukan`, 404),

  // Request tidak valid
  badRequest: (reply: FastifyReply, message: string, details?: any) =>
    sendError(reply, 'BAD_REQUEST', message, 400, details),

  // Konflik data
  conflict: (reply: FastifyReply, message: string) =>
    sendError(reply, 'CONFLICT', message, 409),

  // Validasi gagal
  validation: (reply: FastifyReply, errors: any[]) =>
    sendError(reply, 'VALIDATION_ERROR', 'Validasi gagal', 400, errors),

  // Error server internal
  internal: (reply: FastifyReply, message: string = 'Terjadi kesalahan server') =>
    sendError(reply, 'INTERNAL_ERROR', message, 500),

  // Terlalu banyak request
  tooManyRequests: (reply: FastifyReply, message: string = 'Terlalu banyak request') =>
    sendError(reply, 'RATE_LIMIT_EXCEEDED', message, 429),

  // Koin tidak cukup
  insufficientCoins: (reply: FastifyReply) =>
    sendError(reply, 'INSUFFICIENT_COINS', 'Koin tidak cukup', 400),
};
