import { Category } from './category';

export class Product {
  _id: string;
  slug: string;
  title: string;
  price: string;
  categories: Category[];
  image: string;

  constructor(obj) {
    this._id = obj._id;
    this.slug = obj.slug;
    this.title = obj.title;
    this.price = obj.metadata.price;
    this.image = obj.metadata.image.url;
    this.categories = [];

    if (obj.metadata && obj.metadata.categories) {
      obj.metadata.categories.map(category => this.categories.push(new Category(category)));
    }
  }
}
