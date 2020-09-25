import { Category } from './category';

export class User {
  _id: string;
  slug: string;
  interests: JSON;

  constructor(obj?) {
    this._id = obj ? obj._id : '';
    this.slug = obj ? obj.slug : '';
    this.interests = obj ? JSON.parse(obj.metadata.interests) : {};
  }

  postBody() {
    return {
      title: this.slug,
      type_slug: 'users',
      metafields: [
        {
          type: 'JSON',
          title: 'interests',
          key: 'interests',
          value: JSON.stringify(this.interests)
        }
      ]
    };
  }

  putBody() {
    return {
      title: this.slug,
      slug: this.slug,
      metafields: [
        {
          type: 'JSON',
          title: 'interests',
          key: 'interests',
          value: JSON.stringify(this.interests)
        }
      ]
    };
  }

  increaseInterest(category: Category, weight: number) {
    if (!this.interests[category.title]) {
      this.interests[category.title] = weight;
    } else {
      this.interests[category.title] += weight;
    }
  }
}
