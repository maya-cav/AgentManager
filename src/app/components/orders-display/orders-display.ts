import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrdersService } from '../../services/orders';
import { AuthService } from '../../services/auth';
import { Order, OrderLine } from '../../models/order.model';
import { ExtraData } from '../extra-data/extra-data';

interface OrderWithExtra extends Order {
  showExtra: boolean;
}

@Component({
  selector: 'app-orders-display',
  standalone: true,
  imports: [FormsModule, ExtraData],
  templateUrl: './orders-display.html',
  styleUrl: './orders-display.css',
})
export class OrdersDisplay implements OnInit {
  readonly tableHeaderColumns = ['מספר הזמנה', 'שם הלקוח', 'שם הסוכן', 'תאריך הזמנה', 'סיבת החסימה', 'ערך הזמנה', 'קו חלוקה', 'שיחרור הזמנה', 'שורות הזמנה'];
  readonly filterableColumns = ['מספר הזמנה', 'שם הלקוח', 'שם הסוכן', 'תאריך הזמנה', 'סיבת החסימה', 'ערך הזמנה', 'קו חלוקה'];

  private readonly columnKeyMap: Record<string, keyof Order> = {
    'מספר הזמנה': 'orderId',
    'שם הלקוח': 'customerName',
    'שם הסוכן': 'agent',
    'תאריך הזמנה': 'orderDate',
    'סיבת החסימה': 'reason',
    'ערך הזמנה': 'totalValue',
    'קו חלוקה': 'dividingLine'
  };

  allOrders: OrderWithExtra[] = [];
  filteredOrders: OrderWithExtra[] = [];
  filters: Record<string, string> = {};

  // Desktop extra-data modal
  selectedOrderId = '';
  extraDataOpen = false;

  // Mobile filter overlay
  filterOpen = false;

  isDesktop = window.innerWidth >= 480;

  // Toast notification
  toast = { visible: false, message: '', type: 'success' as 'success' | 'error' | 'warning' };
  private toastTimer: any;

  // Confirm dialog
  confirmDialog = { visible: false, title: '', message: '' };
  private pendingReleaseId = '';

  constructor(private ordersService: OrdersService, private authService: AuthService) { }

  ngOnInit() {
    const raw = this.ordersService.getOrders();
    this.allOrders = raw.map(o => ({ ...o, showExtra: false }));
    this.filteredOrders = [...this.allOrders];
    this.filterableColumns.forEach(col => (this.filters[col] = ''));
  }

  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 480;
  }

  mapColumnKey(header: string): keyof Order {
    return this.columnKeyMap[header];
  }

  // Filtering
  applyFilters() {
    this.filteredOrders = this.allOrders.filter(item =>
      this.filterableColumns.every(col => {
        const value = this.filters[col]?.trim().toLowerCase();
        if (!value) return true;
        const key = this.mapColumnKey(col);
        return String(item[key]).toLowerCase().includes(value);
      })
    );
  }

  resetFilters() {
    this.filterableColumns.forEach(col => (this.filters[col] = ''));
    this.filteredOrders = [...this.allOrders];
  }

  getDropdownValues(col: string): string[] {
    const key = this.mapColumnKey(col);
    return [...new Set(this.filteredOrders.map(item => String(item[key])))];
  }

  // Mobile filter overlay
  openFilter() { this.filterOpen = true; }
  closeFilter() { this.filterOpen = false; }

  applyMobileFilter() {
    this.applyFilters();
    this.filterOpen = false;
  }

  // Desktop extra-data modal
  openExtraData(orderId: string) {
    this.selectedOrderId = orderId;
    this.extraDataOpen = true;
  }

  closeExtraData() {
    this.extraDataOpen = false;
    this.selectedOrderId = '';
  }

  // Mobile inline extra-data
  toggleExtra(order: OrderWithExtra) {
    order.showExtra = !order.showExtra;
  }

  getExtraLines(orderId: string): OrderLine[] {
    return this.ordersService.getOrderLines(orderId);
  }

  // Toast
  showToast(message: string, type: 'success' | 'error' | 'warning') {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, type };
    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, 4000);
  }

  private async refreshOrders() {
    await this.ordersService.fetchOrders();
    const raw = this.ordersService.getOrders();
    this.allOrders = raw.map(o => ({ ...o, showExtra: false }));
    this.applyFilters();
  }

  logout() {
    this.authService.logout();
  }

  // Release order
  onRelease(orderId: string) {
    this.pendingReleaseId = orderId;
    this.confirmDialog = {
      visible: true,
      title: 'שחרור הזמנה',
      message: `האם לשחרר את הזמנה מספר ${orderId}?`,
    };
  }

  cancelRelease() {
    this.confirmDialog.visible = false;
    this.pendingReleaseId = '';
  }

  async confirmRelease() {
    const orderId = this.pendingReleaseId;
    this.confirmDialog.visible = false;
    this.pendingReleaseId = '';

    try {
      const res = await this.ordersService.releaseOrder(orderId);
      const release = res.Release || res;
      if (release.isLocked) {
        this.showToast(`הזמנה ${orderId} לא טופלה - מטופלת במסוף אחר`, 'error');
      } else if (release.error) {
        this.showToast(`הזמנה ${orderId} לא שוחררה: ${release.error}`, 'error');
      } else if (release['Still-Block']) {
        this.showToast(`הזמנה ${orderId} עדיין חסומה: ${release['Still-Block']}`, 'error');
      } else if (release.Open) {
        this.showToast(`הזמנה ${orderId} שוחררה, אך קיים ממצא פתוח: ${release.Open}`, 'warning');
        await this.refreshOrders();
      } else if (release.Released) {
        this.showToast(`הזמנה ${orderId} שוחררה בהצלחה`, 'success');
        await this.refreshOrders();
      } else {
        this.showToast('שגיאה בשחרור ההזמנה', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      this.showToast(`שגיאה בשחרור הזמנה: ${errorMessage}`, 'error');
    }
  }
}
