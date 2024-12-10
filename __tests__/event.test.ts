import { createEvent, getAllEvents } from '@/lib/actions/event.actions';
import Event from '@/lib/database/models/event.model';
import User from '@/lib/database/models/user.model';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database';


// Mock revalidatePath
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
  }));

describe('Event Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  const mockEvent = {
    userId,
    event: {
      title: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      imageUrl: 'https://example.com/image.jpg',
      startDateTime: new Date('2024-12-01'),
      endDateTime: new Date('2024-12-02'),
      categoryId: new mongoose.Types.ObjectId().toString(),
      price: '100',
      isFree: false,
      url: 'https://example.com/event'
    },
    path: 'test/path'
  };

  beforeAll(async () => {
    await connectToDatabase();
  }, 10000);

  describe('Creating Events', () => {
    beforeEach(async () => {
      // Create a test user first
      await User.create({
        _id: userId,
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        photo: 'https://example.com/photo.jpg'
      });
    }, 10000);

    it('should create an event successfully', async () => {
      const newEvent = await createEvent(mockEvent);
      expect(newEvent).toBeTruthy();
      const event = await Event.findOne({ title: mockEvent.event.title });
      expect(event).toBeTruthy();
    }, 10000);
  });

  describe('Getting Events', () => {
    beforeEach(async () => {
      await Event.create(mockEvent.event);
    }, 10000);

    it('should list all events', async () => {
      const events = await getAllEvents({
        query: '',
        category: '',
        limit: 10,
        page: 1
      });
      expect(events).toBeDefined();
      expect(Array.isArray(events.data)).toBeTruthy();
    }, 10000);
  });
});