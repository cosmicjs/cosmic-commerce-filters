import { Component, Input, OnChanges } from '@angular/core';
import { Product } from 'src/models/product';
import { User } from '@models/user';
import { Category } from '@models/category';
import { UserService } from 'src/app/core/_services/user.service';
import { CosmicService } from 'src/app/core/_services/cosmic.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent {
  constructor(private userService: UserService, private cosmicService: CosmicService, private toastr: ToastrService) {}

  @Input() product: Product;

  viewProduct() {
    this.increaseInterest(1);
  }

  addProductToCart() {
    this.increaseInterest(2);
  }

  buyProduct() {
    this.increaseInterest(3);
  }

  increaseInterest(weight: number) {
    const user: User = this.userService.getSessionUser();
    const categories: String[] = [];
    this.product.categories.forEach((category: Category) => {
      user.increaseInterest(category, weight);
      categories.push(category.title);
    }, this);

    this.userService.setSessionUser(user);
    this.cosmicService.updateUser(user).subscribe();

    this.toastr.info(`User increased interest by ${weight} points in categories ${categories.toString()}.`);
    window.scrollTo(0, 0);
  }
}
