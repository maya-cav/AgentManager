import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Order, OrderLine } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {

  private orders: Order[] = [];

  constructor(private apiService: ApiService) { }

  async fetchOrders(): Promise<Order[]> {
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'EXTDATAMCALL' });
    const result = await this.apiService.post(url, {});

    this.orders = Array.isArray(result) ? result.flatMap((o: any) => {
      const items: OrderLine[] = Array.isArray(o.Items)
        ? o.Items.map((item: any) => ({
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
        }))
        : [];

      const base = {
        orderId: String(o.orderId || ''),
        customerName: o.customerName || '',
        agent: o.agent || '',
        orderDate: o.orderDate || '',
        totalValue: String(o.totalValue || ''),
        dividingLine: String(o.dividingLine || ''),
        orderLines: items,
      };

      const fclose = o['F-CLOSE'];
      if (fclose && typeof fclose === 'object') {
        const reasons = Object.values(fclose) as string[];
        if (reasons.length > 1) {
          return reasons.map(reason => ({ ...base, reason }));
        }
        return [{ ...base, reason: reasons[0] || '' }];
      }
      return [{ ...base, reason: '' }];
    }) : [];

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
    try {
      // Keep payload identical to the original working implementation.
      const result = await this.apiService.post(url, { ORDID: orderId });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
