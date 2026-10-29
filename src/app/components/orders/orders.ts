import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/orders';
import { OrdersDisplay } from '../orders-display/orders-display';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [OrdersDisplay],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  loading = true;
  error = '';

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.load();
  }

  // On failure show only the error - never "no blocked orders", which would look like everything was released.
  async load() {
    this.loading = true;
    this.error = '';
    try {
      await this.ordersService.fetchOrders();
    } catch {
      this.error = 'שגיאה בטעינת ההזמנות.';
    }
    this.loading = false;
  }
}
