import { Component, OnInit } from '@angular/core';
import { CosmicService } from 'src/app/core/_services/cosmic.service';
import { Product } from '@models/product';
import { UserService } from 'src/app/core/_services/user.service';
import { User } from '@models/user';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.scss']
})
export class ProductListingComponent implements OnInit {
  public productList: Product[];
  public user: User;

  constructor(private cosmicService: CosmicService, private userService: UserService) {}

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      this.user = user;
    });
    this.cosmicService.getProducts().subscribe(products => (this.productList = products));
  }
}
