class Product {
  // prettier-ignore
  constructor({ sku, product_name, suppliers, quantity, expire_date, price, category }) {
    this.sku = sku;              
    this.product_name = product_name;  
    this.suppliers = suppliers;
    this.quantity = quantity;
    this.expire_date = expire_date;    
    this.price = price;
    this.category = category;
  }
}

export default new Product();
