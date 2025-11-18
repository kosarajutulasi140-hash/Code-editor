import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class Ai {
  constructor(private http: HttpClient){}

  getCompletion(code:string, cursor: number){
    return this.http.post<any>('/api/complete-code', { code,  cursorOffset: cursor} )
  }
}
