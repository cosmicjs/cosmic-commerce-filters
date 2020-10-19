import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { Category } from '@models/category';
import { PriceFilter } from '@models/price-filter';
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
  public priceList: Map<PriceFilter, boolean> = new Map<PriceFilter, boolean>();

  @Output() selectedFilters = new EventEmitter<string>();

  constructor(private cosmicService: CosmicService) {}

  ngOnInit() {
    /** */
    /*hay que usar props para reducir las peticiones
     */
    forkJoin(this.cosmicService.getCategories(), this.cosmicService.getProducts(), this.cosmicService.getPriceFilters()).subscribe(
      ([categories, products, priceFilters]) => {
        // categories
        categories.forEach(cat => {
          cat.isRoot ? this.rootCategoryList.set(cat, false) : this.categoryList.set(cat, false);
        });

        // colors

        const colorSet = new Set<string>(); // Using a Set will automatically discard repeated colors
        products.forEach(p => colorSet.add(p.color));
        colorSet.forEach(c => {
          this.colorList.set(c, false);
        });

        // prices
        priceFilters.forEach(pf => this.priceList.set(pf, false));

        this.updateSelectedFilters();
      }
    );
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

  filterPrice(entry: { key: PriceFilter; value: boolean }) {
    this.priceList.set(entry.key, !entry.value);
    this.updateSelectedFilters();
  }

  ///////////

  setCategoryFilterSelection(collection: Map<Category, boolean>, catInSelection: string[], catNotInSelection: string[]) {
    const inList: string[] = [];
    const ninList: string[] = [];
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
    const inList = [];
    collection.forEach((value: boolean, key: string) => {
      if (value === true) {
        inList.push(key);
      }
    });
    return inList;
  }

  setPriceFilterSelection(collection: Map<PriceFilter, boolean>): number[][] {
    const inList: number[][] = [];

    collection.forEach((value: boolean, key: PriceFilter) => {
      if (value === true) {
        const range = [key.min, key.max];
        inList.push(range);
      }
    });

    return inList;
  }

  ///////////

  updateSelectedFilters() {
    // categories
    const catInSelection: string[] = [];
    const catNotInSelection: string[] = [];

    this.setCategoryFilterSelection(this.categoryList, catInSelection, catNotInSelection);
    this.setCategoryFilterSelection(this.rootCategoryList, catInSelection, catNotInSelection);

    // colors

    const colorInSelection: string[] = this.setColorFilterSelection(this.colorList);

    // price
    const pricesInSelection: number[][] = this.setPriceFilterSelection(this.priceList);

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

    if (pricesInSelection.length > 0) {
      jsonObj['$or'] = [];
      pricesInSelection.forEach(price => {
        jsonObj['$or'].push({
          $and: [
            {
              'metadata.price': {
                $gte: price[0]
              }
            },
            {
              'metadata.price': {
                $lte: price[1]
              }
            }
          ]
        });
      });

      // Introducing "$or" means we need to combine with an "$and" for the other conditions
      const auxObj = { $and: [] };

      auxObj.$and.push(
        { "'metadata.categories": jsonObj['metadata.categories'], 'metadata.color': jsonObj['metadata.color'] },
        { $or: jsonObj['$or'] }
      );
      jsonObj = auxObj;
    }

    const query = encodeURIComponent(JSON.stringify(jsonObj));
    this.selectedFilters.emit(query);
  }
}
