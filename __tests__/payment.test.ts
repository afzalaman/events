// Create mock functions first
const mockStripeCreate = jest.fn().mockResolvedValue({ url: 'https://test-checkout-url.com' });

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

// Mock Stripe with a more detailed implementation
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeCreate
      }
    }
  }));
});

import { checkoutOrder } from '@/lib/actions/order.actions';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database';

describe('Payment Tests', () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const buyerId = new mongoose.Types.ObjectId().toString();

  const mockCheckoutData = {
    eventTitle: 'Test Event',
    eventId,
    price: '100',
    isFree: false,
    buyerId
  };

  beforeAll(async () => {
    await connectToDatabase();
  }, 10000);

  beforeEach(() => {
    mockStripeCreate.mockClear();
    const { redirect } = require('next/navigation');
    redirect.mockClear();
  });

  describe('Checkout Process', () => {
    it('should handle free events', async () => {
      const freeEventData = { ...mockCheckoutData, price: '0', isFree: true };
      await checkoutOrder(freeEventData);
      
      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [expect.objectContaining({ 
            price_data: expect.objectContaining({ 
              unit_amount: 0,
              currency: 'usd'
            }) 
          })],
          metadata: { eventId, buyerId },
          mode: 'payment'
        })
      );
      
      const { redirect } = require('next/navigation');
      expect(redirect).toHaveBeenCalledWith('https://test-checkout-url.com');
    }, 10000);

    it('should create a checkout session for paid events', async () => {
      await checkoutOrder(mockCheckoutData);
      
      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [expect.objectContaining({ 
            price_data: expect.objectContaining({ 
              unit_amount: 10000,
              currency: 'usd'
            }) 
          })],
          metadata: { eventId, buyerId },
          mode: 'payment'
        })
      );
      
      const { redirect } = require('next/navigation');
      expect(redirect).toHaveBeenCalledWith('https://test-checkout-url.com');
    }, 10000);
  });
});