import { Component, OnInit } from '@angular/core';
import { Category } from '@models/category';
import { CosmicService } from 'src/app/core/_services/cosmic.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  public categoryList: Category[];

  constructor(private cosmicService: CosmicService) {}

  ngOnInit() {
    this.cosmicService.getCategories().subscribe(categories => (this.categoryList = categories));
  }

  filter(category) {
    category.selected = !category.selected;
    const selection = this.categoryList.filter((category, index) => {
      return category.selected;
    });
    console.log(selection);
  }
}
