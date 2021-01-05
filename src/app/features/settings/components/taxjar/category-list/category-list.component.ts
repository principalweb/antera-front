import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';
import { interval, fromEvent, merge, Observable, of as observableOf } from 'rxjs';
import { debounce, catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { TaxCategory } from 'app/models/tax-category';
import { TaxCollection } from 'app/models/tax-collection';
import { RestParams } from 'app/models/rest-params';



@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class CategoryListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'productTaxCode', 'description'];
  data: TaxCategory[];
  // might think of a better way to represent these values
  filters = {
    terms: {
      name: '',
      productTaxCode: '',
      description:'' 
    },
    operator: {
      name: 'like',
      productTaxCode: 'like',
      description: 'like',
    }
  }

  restParams: RestParams = new RestParams({perPage: 20, order: 'name', orient: 'asc'});

  categories$: Observable<TaxCollection>;

  resultsLength = 0;
  isLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('nameKeyup') nameKeyup: ElementRef;
  @ViewChild('productTaxCodeKeyup') productTaxCodeKeyup: ElementRef;
  @ViewChild('descriptionKeyup') descriptionKeyup: ElementRef;

  constructor(
    public service: IntegrationService,
    public msg: MessageService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const name$ = fromEvent<KeyboardEvent>(this.nameKeyup.nativeElement, 'keyup');
    const pcode$ = fromEvent<KeyboardEvent>(this.productTaxCodeKeyup.nativeElement, 'keyup');
    const desc$ = fromEvent<KeyboardEvent>(this.descriptionKeyup.nativeElement, 'keyup');

    this.sort.direction = 'asc';
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, name$, pcode$, desc$)
      .pipe(
        debounce(() => interval(500)),
        startWith([]),
        switchMap(() => {
          this.isLoading = true;
          this.restParams.page = this.paginator.pageIndex + 1;
          this.restParams.perPage = this.paginator.pageSize;
          this.restParams.orient = this.sort.direction;
          this.restParams.order = this.sort.active;
          return this.service.getTaxCategories(this.filters, this.restParams).pipe(
            map((res: TaxCollection) => {
              return res;
            })
          );
        }),
        map((data: TaxCollection) => {
          this.isLoading = false;
          this.resultsLength = data._meta.totalCount;
          return data;
        }),
        catchError((err) => {
          this.isLoading = false;
          return observableOf([]);
        })
      ).subscribe((col: TaxCollection) => this.data = col.data);
  }

  importCategories() {
    this.isLoading = true;
    this.service.importTaxCategories().subscribe(((res) => {
      this.sort.sortChange.next();
    }));
  }
}