import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Category } from '@models/category';
import { User } from '@models/user';
import { Product } from '@models/product';
import { PriceFilter } from '@models/price-filter';

/**
 * A service to get data from CosmicJS.
 */
@Injectable({
  providedIn: 'root'
})
export class CosmicService {
  constructor(private http: HttpClient) {}

  private commonPath = environment.URL + environment.bucket_slug;
  private addObjectPath = this.commonPath + '/add-object';
  private editObjectPath = this.commonPath + '/edit-object';
  private objectTypePath = this.commonPath + '/object-type';

  private singleObjectUrl = this.commonPath + '/object';
  private singleObjectByIdUrl = this.commonPath + '/object-by-id';
  private multipleObjectsUrl = this.commonPath + '/objects';

  private productsUrl = this.objectTypePath + '/products';
  private productObjectsUrl = this.multipleObjectsUrl + '?type=products';

  private products$ = new Map<string, Observable<Product[]>>();

  private categoriesUrl = this.objectTypePath + '/categories';

  private categories$: Observable<Category[]>;

  private priceFiltersUrl = this.objectTypePath + '/pricefilters';

  private priceFilters$: Observable<PriceFilter[]>;

  getUser(slug: string): Observable<User> {
    const url = `${this.singleObjectUrl}/${slug}`;
    return this.http.get<User>(url).pipe(
      tap(_ => console.log(`fetched user: ${slug}`)),
      map(_ => {
        return new User(_['object']);
      }),
      catchError(this.handleError<User>(`getUser: ${slug}`))
    );
  }

  updateUser(user: User) {
    return this.http.put<User>(this.editObjectPath, JSON.stringify(user.putBody())).pipe(
      map(_ => {
        return new User(_['object']);
      }),
      catchError(this.handleError<User>())
    );
  }

  setUser(user: User) {
    return this.http.post<User>(this.addObjectPath, JSON.stringify(user.postBody())).pipe(
      map(_ => {
        return new User(_['object']);
      }),
      catchError(this.handleError<User>())
    );
  }

  getProducts(): Observable<Product[]> {
    if (!this.products$.get('')) {
      const response = this.http.get<Product[]>(this.productsUrl + '?sort=random').pipe(
        tap(_ => console.log('fetched products')),
        map(_ => {
          return _['objects'].map(element => new Product(element));
        }),
        shareReplay(1),
        catchError(this.handleError('getProducts', []))
      );
      this.products$.set('', response);
    }
    return this.products$.get('');
  }

  getProductsByQuery(query?: string): Observable<Product[]> {
    if (!this.products$.get(query)) {
      const querystring = query ? '&query=' + query : '';

      const response = this.http.get<Product[]>(this.productObjectsUrl + '&sort=random' + querystring).pipe(
        tap(_ => console.log('fetched products')),
        map(_ => {
          if (_['objects']) {
            return _['objects'].map(element => new Product(element));
          }
        }),
        shareReplay(1),
        catchError(this.handleError('getProducts', []))
      );
      this.products$.set(query, response);
    }
    return this.products$.get(query);
  }

  getCategories(): Observable<Category[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<Category[]>(this.categoriesUrl).pipe(
        tap(_ => console.log('fetched categories')),
        map(_ => {
          return _['objects'].map(element => new Category(element));
        }),
        shareReplay(1),
        catchError(this.handleError('getCategory', []))
      );
    }
    return this.categories$;
  }

  getPriceFilters(): Observable<PriceFilter[]> {
    if (!this.priceFilters$) {
      this.priceFilters$ = this.http.get<PriceFilter[]>(this.priceFiltersUrl).pipe(
        tap(_ => console.log('fetched price filters')),
        map(_ => {
          return _['objects'].map(element => new PriceFilter(element));
        }),
        shareReplay(1),
        catchError(this.handleError('getPriceFilters', []))
      );
    }
    return this.priceFilters$;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
