import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpendataService {

  constructor(private http: HttpClient) { }

  GetData(county:string, recordType: number):Observable<any> {
    if (recordType == 1) {
      return this.http.get('https://failteireland.azure-api.net/opendata-api/v1/activities?$filter=address/addressRegion eq \'' + county + '\'');
    } else if (recordType == 2) {
      return this.http.get('https://failteireland.azure-api.net/opendata-api/v1/accommodation?$filter=address/addressRegion eq \'' + county + '\'');
    } else if (recordType == 3) {
      return this.http.get('https://failteireland.azure-api.net/opendata-api/v1/attractions?$filter=address/addressRegion eq \'' + county + '\'');
    } else {
      return EMPTY;
    }
  }
}
