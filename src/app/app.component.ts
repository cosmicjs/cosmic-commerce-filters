import { Component, OnInit } from '@angular/core';
import { User } from '@models/user';
import { UserService } from './core/_services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Cosmic-Customization Commerce';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.init();
  }
}
