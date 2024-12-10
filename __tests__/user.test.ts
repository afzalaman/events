import request from 'supertest';
import { createUser } from '@/lib/actions/user.actions';
import User from '@/lib/database/models/user.model';
import { NextResponse } from 'next/server';

describe('User Tests', () => {
  const mockUser = {
    clerkId: 'test_clerk_id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    photo: 'https://example.com/photo.jpg'
  };

  describe('Registration', () => {
    it('should create a new user successfully', async () => {
      const newUser = await createUser(mockUser);
      expect(newUser).toBeTruthy();
      expect(newUser.email).toBe(mockUser.email);
    });

    it('should fail when registering with existing email', async () => {
      // First create a user directly with mongoose
      await User.create(mockUser);

      // Try to create the same user with different clerkId but same email
      const duplicateUser = {
        ...mockUser,
        clerkId: 'different_clerk_id',
        username: 'different_username'
      };

      try {
        await User.create(duplicateUser);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.name).toBe('MongoServerError');
        expect(error.code).toBe(11000); // MongoDB duplicate key error code
      }
    });
  });
});