import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCouponDiscount, calculateShipping } from '../utils/orderUtils.js';

test('calculates free and standard shipping from the server threshold', () => {
  assert.equal(calculateShipping(10000), 0);
  assert.equal(calculateShipping(9999), 450);
});

test('calculates percentage and fixed coupon discounts with caps', () => {
  assert.equal(calculateCouponDiscount({ discountType: 'percentage', discountValue: 10, minimumOrder: 0 }, 1000), 100);
  assert.equal(calculateCouponDiscount({ discountType: 'fixed', discountValue: 250, maximumDiscount: 100, minimumOrder: 0 }, 1000), 100);
  assert.equal(calculateCouponDiscount({ discountType: 'percentage', discountValue: 10, minimumOrder: 2000 }, 1000), 0);
});