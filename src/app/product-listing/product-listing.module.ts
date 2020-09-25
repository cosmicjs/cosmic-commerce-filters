import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { ActionsComponent } from './actions/actions.component';
import { CustomSortPipe } from './_pipes/custom-sort.pipe';

@NgModule({
  declarations: [ProductListingComponent, ActionsComponent, CustomSortPipe],
  imports: [
    CommonModule
  ]
})
export class ProductListingModule { }
