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
  public rootCategoryList: Map<Category, boolean> = new Map<Category, boolean>();
  public categoryList: Map<Category, boolean> = new Map<Category, boolean>();
  public colorList: Map<string, boolean> = new Map<string, boolean>();

  @Output() selectedFilters = new EventEmitter<string>();

  constructor(private cosmicService: CosmicService) {}

  ngOnInit() {
    /** */
    /*hay que usar props para reducir las peticiones
     */
    forkJoin(this.cosmicService.getCategories(), this.cosmicService.getProducts()).subscribe(([categories, products]) => {
      // categories
      categories.forEach(cat => {
        cat.isRoot ? this.rootCategoryList.set(cat, false) : this.categoryList.set(cat, false);
      });

      // colors

      let colorSet = new Set<string>(); // Using a Set will automatically discard repeated colors
      products.forEach(p => colorSet.add(p.color));
      colorSet.forEach(c => {
        this.colorList.set(c, false);
      });

      this.updateSelectedFilters();
    });
  }

  ///////////

  filterRootCategory(entry?: { key: Category; value: boolean }) {
    this.rootCategoryList.set(entry.key, !entry.value);
    this.updateSelectedFilters();
  }

  filterCategory(entry: { key: Category; value: boolean }) {
    this.categoryList.set(entry.key, !entry.value);
    this.updateSelectedFilters();
  }

  filterColor(entry: { key: string; value: boolean }) {
    this.colorList.set(entry.key, !entry.value);
    this.updateSelectedFilters();
  }

  ///////////

  setCategoryFilterSelection(collection: Map<Category, boolean>, catInSelection: string[], catNotInSelection: string[]) {
    let inList: string[] = [];
    let ninList: string[] = [];
    collection.forEach((selected, category) => {
      if (selected) {
        inList.push(category._id);
      } else {
        ninList.push(category._id);
      }
    });

    /**
     * Only push elements if not all categories are either selected or unselected,
     * in that case we don't need filtering anything
     */
    if (inList.length !== 0 && ninList.length !== 0) {
      catInSelection.push(...inList);
      catNotInSelection.push(...ninList);
    }
  }

  setColorFilterSelection(collection: Map<string, boolean>): string[] {
    let inList = [];
    collection.forEach((value: boolean, key: string) => {
      if (value === true) inList.push(key);
    });
    return inList;
  }

  ///////////

  updateSelectedFilters() {
    // categories
    let catInSelection: string[] = [];
    let catNotInSelection: string[] = [];

    this.setCategoryFilterSelection(this.categoryList, catInSelection, catNotInSelection);
    this.setCategoryFilterSelection(this.rootCategoryList, catInSelection, catNotInSelection);

    // colors

    let colorInSelection = this.setColorFilterSelection(this.colorList);

    // query
    let jsonObj = {};
    if (catInSelection.length > 0 && catNotInSelection.length > 0) {
      jsonObj['metadata.categories'] = {
        $in: catInSelection,
        $nin: catNotInSelection
      };
    }
    if (colorInSelection.length > 0) {
      jsonObj['metadata.color'] = { $in: colorInSelection };
    }

    const query = encodeURIComponent(JSON.stringify(jsonObj));
    this.selectedFilters.emit(query);
  }
}
