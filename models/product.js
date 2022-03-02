const getDb = require('../util/database').getDb;

class Product {
  constructor(title,price,description,imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  //method to save this object
  save() {
    const db = getDb();
    db.collection('products')
      .insertOne(this)
      .then(result => {
        console.log(result);
      })
      .catch(err=> {
        console.log(err);
      });
  }
}


module.exports = Product;