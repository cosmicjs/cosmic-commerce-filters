export class Category {
  _id: string;
  slug: string;
  title: string;

  constructor(obj) {
    this._id = obj._id;
    this.slug = obj.slug;
    this.title = obj.title;
  }
}
