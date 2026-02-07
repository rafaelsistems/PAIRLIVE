import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated, errors } from '../utils/response';

const authService = new AuthService();

interface RegisterBody {
  email: string;
  password: string;
  displayName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
}

interface LoginBody {
  email: string;
  password: string;
  deviceId?: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export class AuthController {
  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password, displayName, birthDate, gender } = request.body;

      const result = await authService.register({
        email,
        password,
        displayName,
        birthDate: new Date(birthDate),
        gender,
      });

      return sendCreated(reply, result, 'Registration successful');
    } catch (error: any) {
      if (error.code === 'EMAIL_EXISTS') {
        return errors.conflict(reply, 'Email already registered');
      }
      if (error.code === 'VALIDATION_ERROR') {
        return errors.badRequest(reply, error.message);
      }
      return errors.internal(reply);
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password, deviceId } = request.body;

      const result = await authService.login(email, password, deviceId);

      return sendSuccess(reply, result, 'Login successful');
    } catch (error: any) {
      if (error.code === 'INVALID_CREDENTIALS') {
        return errors.unauthorized(reply, 'Invalid email or password');
      }
      if (error.code === 'ACCOUNT_SUSPENDED') {
        return errors.forbidden(reply, 'Account is suspended');
      }
      return errors.internal(reply);
    }
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenBody }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body;

      const result = await authService.refreshToken(refreshToken);

      return sendSuccess(reply, result, 'Token refreshed');
    } catch (error: any) {
      if (error.code === 'INVALID_TOKEN') {
        return errors.unauthorized(reply, 'Invalid refresh token');
      }
      return errors.internal(reply);
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await authService.logout(request.user.userId);

      return sendSuccess(reply, null, 'Logged out successfully');
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.body;

      await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      return sendSuccess(
        reply,
        null,
        'If the email exists, a reset link has been sent'
      );
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      const { token, newPassword } = request.body;

      await authService.resetPassword(token, newPassword);

      return sendSuccess(reply, null, 'Password reset successful');
    } catch (error: any) {
      if (error.code === 'INVALID_TOKEN') {
        return errors.badRequest(reply, 'Invalid or expired reset token');
      }
      return errors.internal(reply);
    }
  }

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      const { currentPassword, newPassword } = request.body;

      await authService.changePassword(
        request.user.userId,
        currentPassword,
        newPassword
      );

      return sendSuccess(reply, null, 'Password changed successfully');
    } catch (error: any) {
      if (error.code === 'INVALID_PASSWORD') {
        return errors.badRequest(reply, 'Current password is incorrect');
      }
      return errors.internal(reply);
    }
  }
}
