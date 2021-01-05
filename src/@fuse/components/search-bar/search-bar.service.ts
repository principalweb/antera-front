import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'environments/environment';
import { AuthService } from 'app/core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FuseSearchBarService {

  searchTerm = '';
  permUserId = '';
  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  get payload() {
    return { quickSearchKeyword: this.searchTerm, permUserId: this.permUserId };
  }

  search(term = '') {
    this.searchTerm = term;
    this.permUserId = this.authService.getCurrentUser().userId;

    return forkJoin([
      this.getProducts(),
      this.getAccounts(),
      this.getContacts(),
      this.getLeads(),
      this.getOpportunities(),
      this.getOrders(),
      this.getQuotes(),
      this.getEmailsContacts(),
      this.getEmailsAccounts(),
      this.getAccountsByContact(),
      this.getArtworks(),
      this.getProduction(),
    ]);
  }

  getProducts() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/product-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getAccounts() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/account-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getContacts() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/contact-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getOrders() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/order-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getQuotes() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/quote-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getLeads() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/lead-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getOpportunities() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/opportunity-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getEmailsContacts() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/email-search-contacts`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getEmailsAccounts() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/email-search-accounts`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getAccountsByContact() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/accounts-by-contact`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getArtworks() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/artwork-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }

  getProduction() {
    if (this.searchTerm) {
      return this.http.post(`${this.baseUrl}/search/production-search`, this.payload).pipe(catchError(error => of([])));
    }

    return of([]);
  }
}
