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

  async ngOnInit() {
    try {
      await this.ordersService.fetchOrders();
    } catch {
      this.error = 'שגיאה בטעינת ההזמנות. נסה לרענן את הדף.';
    }
    this.loading = false;
  }
}
