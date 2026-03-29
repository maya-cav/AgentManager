export interface Order {
  orderId: string;
  customerName: string;
  agent: string;
  orderDate: string;
  reason: string;
  totalValue: string;
  orderLines: OrderLine[];
}

export interface OrderLine {
  itemDescription: string;
  itemNumber: string;
  itemQuantity: string;
  itemPrice: string;
  totalPrice: string;
  lineNote: string;
}
