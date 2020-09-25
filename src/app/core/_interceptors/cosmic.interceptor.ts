import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class CosmicInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.match(/api.cosmicjs/)) {
      let params = new HttpParams({ fromString: req.params.toString() });
      if (req.method === 'GET') {
        params = params.append('read_key', environment.read_key);

        req = req.clone({
          params: params
        });
      } else {
        let payload = JSON.parse(req.body);
        payload.write_key = environment.write_key;

        req = req.clone({
          body: payload
        });
      }
    }
    return next.handle(req);
  }
}
