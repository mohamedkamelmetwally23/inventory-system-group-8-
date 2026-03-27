class StockAdjustments {
  constructor({
    id,
    product_id,
    adjustment_type,
    quantity,
    reason,
    timestamp,
    user,
  }) {
    this.id = id;
    this.product_id = product_id;
    this.adjustment_type = adjustment_type;
    this.quantity = quantity;
    this.reason = reason;
    this.timestamp = timestamp;
    this.user = user;
  }
}

export default StockAdjustments;
