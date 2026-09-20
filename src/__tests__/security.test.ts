import app from '../app';
import request from 'supertest';
import { calculateParcelDeliveryFee } from '../app/utils/calculatePrice';

describe('Security & Role-Based Authorization Tests', () => {
  it('should block unauthenticated requests to admin routes', async () => {
    const res = await request(app).get('/api/v1/admin/users');
    expect(res.status).toBe(401);
  });

  it('should block unauthenticated requests to rider earnings', async () => {
    const res = await request(app).get('/api/v1/rider/profile-earnings');
    expect(res.status).toBe(401);
  });

  it('should block unauthenticated customer history requests', async () => {
    const res = await request(app).get('/api/v1/users/my-payments');
    expect(res.status).toBe(401);
  });

  it('should block malformed bearer tokens before reaching protected handlers', async () => {
    const res = await request(app)
      .get('/api/v1/payments/parcel-id')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('Parcel pricing rules', () => {
  it('does not add an overweight charge up to 3 kg', () => {
    expect(calculateParcelDeliveryFee('Dhaka', 'Dhaka', 3)).toBe(80);
  });

  it('adds 20 BDT for every started kg above 3 kg', () => {
    expect(calculateParcelDeliveryFee('Dhaka', 'Dhaka', 3.1)).toBe(100);
    expect(calculateParcelDeliveryFee('Dhaka', 'Dhaka', 5)).toBe(120);
  });
});