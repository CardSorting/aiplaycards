import { WELCOME_CREDITS } from '../constants';
import { userQueries } from '../db/queries/users';

// User service interface
export interface UserServiceResult {
  isNewUser?: boolean;
  creditsAwarded?: number;
}

class UserService {
  /**
   * Ensure a user exists in the database with welcome credits if new
   */
  async ensureUserExists({
    userId,
  }: {
    userId: string;
  }): Promise<UserServiceResult> {
    try {
      // Check if user already exists
      const existingUser = await userQueries.getByUserId(userId);

      if (existingUser) {
        return {
          isNewUser: false,
          creditsAwarded: 0,
        };
      }

      // Create new user
      await userQueries.create({
        userId,
        credits: WELCOME_CREDITS,
      });

      return {
        isNewUser: true,
        creditsAwarded: WELCOME_CREDITS,
      };
    } catch (error) {
      console.error('[userService.ensureUserExists] Error:', error);
      throw new Error('Failed to ensure user exists');
    }
  }

  /**
   * Get user by userId
   */
  async getUserById(userId: string) {
    try {
      return await userQueries.getByUserId(userId);
    } catch (error) {
      console.error('[userService.getUserById] Error:', error);
      throw new Error('Failed to get user');
    }
  }
}

export const userService = new UserService();
