export class Order {
  constructor({
    id,
    order_number,
    supplier_id,
    creation_date,
    status,
    total_quantity,
    total_amount,
  }) {
    this.id = id;
    this.order_number = order_number;
    this.supplier_id = supplier_id;
    this.creation_date = creation_date;
    this.status = status;
    this.total_quantity = total_quantity;
    this.total_amount = total_amount;
  }
}
