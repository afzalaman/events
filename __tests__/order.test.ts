import { createOrder, getOrdersByEvent } from '@/lib/actions/order.actions';
import Order from '@/lib/database/models/order.model';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database';

describe('Order Tests', () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const buyerId = new mongoose.Types.ObjectId().toString();

  const mockOrder = {
    eventId,
    buyerId,
    totalAmount: '100',
    createdAt: new Date(),
    stripeId: 'test_stripe_id'
  };

  beforeAll(async () => {
    await connectToDatabase();
  }, 10000);

  describe('Creating Orders', () => {
    it('should create an order successfully', async () => {
      const newOrder = await createOrder(mockOrder);
      expect(newOrder).toBeTruthy();
      const order = await Order.findOne({ stripeId: mockOrder.stripeId });
      expect(order).toBeTruthy();
    }, 10000);
  });

  describe('Getting Orders', () => {
    beforeEach(async () => {
      await Order.create({
        ...mockOrder,
        event: eventId,
        buyer: buyerId
      });
    }, 10000);

    it('should get orders by event', async () => {
      const orders = await getOrdersByEvent({ 
        eventId,
        searchString: ''
      });
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBeTruthy();
    }, 10000);
  });
});