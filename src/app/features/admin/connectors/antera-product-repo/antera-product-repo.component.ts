import { Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { Store, select } from '@ngrx/store';
import { Component, OnInit, ViewChild } from '@angular/core';

import { AnteraProductRepoListComponent } from './antera-product-repo-list/antera-product-repo-list.component';
import * as fromAnteraProductRepo from './store/antera-product-repo.reducer';
import * as AnteraProductRepoActions from './store/antera-product-repo.actions';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'antera-product-repo',
  templateUrl: './antera-product-repo.component.html',
  styleUrls: ['./antera-product-repo.component.scss'],
  animations: fuseAnimations
})
export class AnteraProductRepoComponent implements OnInit {
  @ViewChild(AnteraProductRepoListComponent) list: AnteraProductRepoListComponent;

  state$: Observable<any>;

  action = 'list';
  dataId = '';

  constructor(
    private store: Store<any>,
    private msg: MessageService,
  ) {
    // TODO test state is working fine
    this.state$ = this.store.pipe(select('anteraProductRepo'));
  }

  ngOnInit() {
  }

  create() {
    this.store.dispatch(new AnteraProductRepoActions.EditStart());
  }

  backToList() {
    this.store.dispatch(new AnteraProductRepoActions.EditEnd());
  }

  remove() {
    this.list.deleteSelected();
  }

  clearFilters() {
    this.list.clearFilters();
  }
}
