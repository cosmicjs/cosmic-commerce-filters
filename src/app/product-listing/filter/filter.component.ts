import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Category } from '@models/category';
import { CosmicService } from 'src/app/core/_services/cosmic.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  public categoryList: Category[];
  @Output() selectedFilters = new EventEmitter<string[]>();

  constructor(private cosmicService: CosmicService) {}

  ngOnInit() {
    this.cosmicService.getCategories().subscribe(categories => {
      this.categoryList = categories;
      this.updateSelectedFilters();
    });
  }

  filter(category) {
    category.selected = !category.selected;
    this.updateSelectedFilters();
  }

  updateSelectedFilters() {
    let selection = [];

    this.categoryList
      .filter((category, index) => {
        return category.selected;
      })
      .forEach(category => selection.push(category._id));

    this.selectedFilters.emit(selection);
  }
}
