import type { Order } from '@/lib/api/schemas/order';

export type OrderPaymentAction = 'pay' | 'verify';

const PAYMENT_EXPIRY_WINDOW_MS = 60 * 60 * 1000;

export function getOrderPaymentAction(order: Order): OrderPaymentAction | null {
  if (order.status === 'PAYMENT_PENDING') {
    const ageMs = Date.now() - new Date(order.created_at).getTime();
    return ageMs < PAYMENT_EXPIRY_WINDOW_MS ? 'pay' : null;
  }
  if (order.payment_status === 'PENDING') return 'verify';
  return null;
}
