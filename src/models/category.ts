export class Category {
  _id: string;
  slug: string;
  title: string;
  isRoot: boolean;
  selected: boolean;

  constructor(obj) {
    this._id = obj._id;
    this.slug = obj.slug;
    this.title = obj.title;
    this.isRoot = obj.metadata ? obj.metadata.root : false;
    this.selected = true;
  }
}
