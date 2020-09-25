import { Injectable } from '@angular/core';
import { User } from '@models/user';
import { CosmicService } from './cosmic.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSource = new BehaviorSubject<User>(new User());
  public user$ = this.userSource.asObservable();

  constructor(private cosmicService: CosmicService) {}

  init() {
    let sessionID = localStorage.getItem('sessionID');

    if (!sessionID) {
      const user = new User();

      sessionID = Math.random()
        .toString(36)
        .substr(2, 9);

      localStorage.setItem('sessionID', sessionID);
      user.slug = sessionID;

      this.cosmicService.setUser(user).subscribe(user => {
        this.setSessionUser(user);
      });
    } else if (!sessionStorage.getItem('user')) {
      this.cosmicService.getUser(sessionID).subscribe(user => this.setSessionUser(user));
    }
  }

  setSessionUser(user: User) {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.userSource.next(user);
  }

  getSessionUser(): User {
    const user = sessionStorage.getItem('user');

    if (user) {
      return Object.assign(new User(), JSON.parse(user));
    } else {
      return null;
    }
  }
}
