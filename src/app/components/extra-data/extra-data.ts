import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { OrdersService } from '../../services/orders';
import { OrderLine } from '../../models/order.model';

@Component({
  selector: 'app-extra-data',
  standalone: true,
  imports: [],
  templateUrl: './extra-data.html',
  styleUrl: './extra-data.css',
})
export class ExtraData implements OnChanges {
  @Input() orderId = '';
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  headerColumns = ['תיאור פריט', 'מספר פריט', 'כמות', 'מחיר יחידה', 'ערך שורה', 'הערת שורה'];
  orderLines: OrderLine[] = [];

  constructor(private ordersService: OrdersService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderId'] && this.orderId) {
      this.loadOrderLines();
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.orderLines = [];
    }
  }

  loadOrderLines() {
    this.orderLines = this.ordersService.getOrderLines(this.orderId);
  }

  onClose() {
    this.close.emit();
  }
}
