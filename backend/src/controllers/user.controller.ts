import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { sendSuccess, errors } from '../utils/response';

const userService = new UserService();

interface UpdateProfileBody {
  displayName?: string;
  bio?: string;
  interests?: string[];
}

interface UpdatePhotoBody {
  photoUrl: string;
}

export class UserController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await userService.getProfile(request.user.userId);

      if (!user) {
        return errors.notFound(reply, 'User');
      }

      return sendSuccess(reply, user);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async updateProfile(
    request: FastifyRequest<{ Body: UpdateProfileBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.updateProfile(
        request.user.userId,
        request.body
      );

      return sendSuccess(reply, user, 'Profile updated');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'User');
      }
      return errors.internal(reply);
    }
  }

  async updatePhoto(
    request: FastifyRequest<{ Body: UpdatePhotoBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.updatePhoto(
        request.user.userId,
        request.body.photoUrl
      );

      return sendSuccess(reply, user, 'Photo updated');
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return errors.notFound(reply, 'User');
      }
      return errors.internal(reply);
    }
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      await userService.deleteAccount(request.user.userId);

      return sendSuccess(reply, null, 'Account deleted');
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await userService.getStats(request.user.userId);

      return sendSuccess(reply, stats);
    } catch (error) {
      return errors.internal(reply);
    }
  }

  async getPublicProfile(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.getPublicProfile(request.params.userId);

      if (!user) {
        return errors.notFound(reply, 'User');
      }

      return sendSuccess(reply, user);
    } catch (error) {
      return errors.internal(reply);
    }
  }
}
