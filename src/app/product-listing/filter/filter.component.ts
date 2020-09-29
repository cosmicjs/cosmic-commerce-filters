import { NoopAnimationStyleNormalizer } from '@angular/animations/browser/src/dsl/style_normalization/animation_style_normalizer';
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
  @Output() selectedFilters = new EventEmitter<string>();

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
    let inSelection = [];
    let notInSelection = [];

    this.categoryList.forEach(category => {
      if (category.selected) {
        inSelection.push(category._id);
      } else {
        notInSelection.push(category._id);
      }
    });

    const query = encodeURIComponent(
      JSON.stringify({
        'metadata.categories': {
          $and: [{ $in: inSelection }, { $nin: notInSelection }]
        }
      })
    );

    this.selectedFilters.emit(query);
  }
}
