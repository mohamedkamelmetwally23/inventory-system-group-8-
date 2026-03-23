class StockAdjustments {
  constructor({ id, product_id, type, quantity, status, note, date }) {
    this.id = id;
    this.product_id = product_id;
    this.type = type;
    this.quantity = quantity;
    this.status = status;
    this.note = note;
    this.date = date;
  }
}

export default StockAdjustments;
