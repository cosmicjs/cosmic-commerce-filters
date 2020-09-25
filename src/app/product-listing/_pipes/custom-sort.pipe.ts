import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '@models/product';
import { Category } from '@models/category';

@Pipe({
  name: 'customSort'
})
export class CustomSortPipe implements PipeTransform {
  transform(value: Product[], interests: JSON): Product[] {
    value.sort((a: Product, b: Product) => {
      const aWeight = this.getWeight(a.categories, interests);
      const bWeight = this.getWeight(b.categories, interests);

      if (aWeight < bWeight) {
        return 1;
      } else if (aWeight > bWeight) {
        return -1;
      } else {
        return 0;
      }
    });
    return value;
  }

  getWeight(categories: Category[], interests: JSON) {
    let weight = 0;
    categories.forEach(category => {
      weight += interests[category.title] || 0;
    });
    return weight;
  }
}
