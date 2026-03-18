class StockAdjustments {
  constructor({ id, product_id, type, quantity, date, status, note }) {
    this.id = id;
    this.product_id = product_id;
    this.type = type;
    this.quantity = quantity;
    this.date = date;
    this.status = status;
    this.note = note;
  }
}
export default  StockAdjustments;
