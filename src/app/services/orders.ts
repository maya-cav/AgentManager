import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Order, OrderLine } from '../models/order.model';

// %ZCAVJSON returns numbered subscripts as an array only when they are 1..n with no gaps
// (e.g. order lines 1,2,5 come back as an object), so accept both.
function toList(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function formatAmount(value: any): string {
  const num = Number(value);
  if (value === '' || value == null || !Number.isFinite(num)) return String(value ?? '');
  return num.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {

  private orders: Order[] = [];

  constructor(private apiService: ApiService) { }

  async fetchOrders(): Promise<Order[]> {
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'EXTDATAMCALL' });
    const result = await this.apiService.post(url, {});

    this.orders = toList(result).map((o: any) => {
      const items: OrderLine[] = toList(o.Items).map((item: any) => ({
        itemDescription: item.itemDescription || '',
        itemNumber: String(item.itemNumber || ''),
        itemQuantity: String(item.itemQuantity || ''),
        itemPrice: item.itemPrice || '',
        totalPrice: item.totalPrice || '',
        lineNote: item.lineNote
          ? (typeof item.lineNote === 'object'
            ? Object.values(item.lineNote).join(', ')
            : String(item.lineNote))
          : '',
      }));

      // One row per order - an order blocked for several reasons used to appear several times.
      const reasons = toList(o['F-CLOSE']).map(String).filter(Boolean);

      return {
        orderId: String(o.orderId || ''),
        customerName: o.customerName || '',
        agent: o.agent || '',
        orderDate: o.orderDate || '',
        reason: reasons.join(' | '),
        totalValue: formatAmount(o.totalValue),
        dividingLine: String(o.dividingLine || ''),
        orderLines: items,
      };
    });

    return this.orders;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderLines(orderId: string): OrderLine[] {
    const order = this.orders.find(o => o.orderId === orderId);
    return order?.orderLines ?? [];
  }

  async releaseOrder(orderId: string): Promise<any> {
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'RELEASEORD' });
    return this.apiService.post(url, { ORDID: orderId });
  }
}
