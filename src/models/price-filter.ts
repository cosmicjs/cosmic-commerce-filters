export class PriceFilter {
  _id: string;
  slug: string;
  title: string;
  max: number;
  min: number;

  constructor(obj) {
    this._id = obj._id;
    this.slug = obj.slug;
    this.title = obj.title;
    this.max = obj.metadata.max;
    this.min = obj.metadata.min;
  }
}
