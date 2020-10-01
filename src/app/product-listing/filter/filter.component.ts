import { NoopAnimationStyleNormalizer } from '@angular/animations/browser/src/dsl/style_normalization/animation_style_normalizer';
import { not } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Category } from '@models/category';
import { forkJoin } from 'rxjs';
import { CosmicService } from 'src/app/core/_services/cosmic.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  public rootCategoryList: Category[] = [];
  public categoryList: Category[] = [];
  public colorList: Map<string, boolean> = new Map<string, boolean>();

  @Output() selectedFilters = new EventEmitter<string>();

  constructor(private cosmicService: CosmicService) {}

  ngOnInit() {
    /** */
    /*hay que usar props para reducir las peticiones
     */
    forkJoin(this.cosmicService.getCategories(), this.cosmicService.getProducts()).subscribe(([categories, products]) => {
      categories.forEach(cat => {
        cat.isRoot ? this.rootCategoryList.push(cat) : this.categoryList.push(cat);
      });

      let colorSet = new Set<string>();
      products.forEach(p => colorSet.add(p.color)); // Using a Set will automatically discard repeated colors
      colorSet.forEach(c => {
        this.colorList.set(c, true);
      });

      this.updateSelectedFilters();
    });
  }

  updateSelectedFilters() {
    let catInSelection = [];
    let catNotInSelection = [];

    this.sortCategoryFilterSelection(this.rootCategoryList, catInSelection, catNotInSelection);
    this.sortCategoryFilterSelection(this.categoryList, catInSelection, catNotInSelection);

    let colorInSelection = this.sortColorFilterSelection(this.colorList);

    let jsonObj = {
      'metadata.categories': {
        $in: catInSelection,
        $nin: catNotInSelection
      }
    };

    if (colorInSelection.length > 0) {
      jsonObj['metadata.color'] = { $in: colorInSelection };
    }

    const query = encodeURIComponent(JSON.stringify(jsonObj));
    this.selectedFilters.emit(query);
  }

  ///////////

  filterRootCategory(category?: Category) {
    if (category) {
      this.rootCategoryList.forEach(cat => (cat.selected = cat === category ? true : false));
    } else {
      this.rootCategoryList.forEach(cat => (cat.selected = true));
    }
    this.updateSelectedFilters();
  }

  filterCategory(category: Category) {
    category.selected = !category.selected;
    this.updateSelectedFilters();
  }

  filterColor(color) {
    //Como defino q es un par de valores?
    this.colorList.set(color.key, !color.value);
    this.updateSelectedFilters();
  }

  ///////////

  sortCategoryFilterSelection(collection, inList, ninList) {
    collection.forEach(category => {
      if (category.selected) {
        inList.push(category._id);
      } else {
        ninList.push(category._id);
      }
    });
  }

  sortColorFilterSelection(collection: Map<string, boolean>): string[] {
    let inList = [];
    collection.forEach((value: boolean, key: string) => {
      if (value === true) inList.push(key);
    });
    return inList;
  }
}
