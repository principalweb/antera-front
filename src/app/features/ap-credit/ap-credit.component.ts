import { take } from 'rxjs/operators';
import { ApCredit } from 'app/models/ap-credit';
import { Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { ApCreditListComponent } from './ap-credit-list/ap-credit-list.component';
import { ApCreditFormComponent } from './ap-credit-form/ap-credit-form.component';

import * as fromApCredit from './store/ap-credit.reducer';
import * as ApCreditActions from './store/ap-credit.actions';
import { MessageService } from 'app/core/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ap-credit',
  templateUrl: './ap-credit.component.html',
  styleUrls: ['./ap-credit.component.scss'],
  animations: fuseAnimations
})
export class ApCreditComponent implements OnInit {
  @ViewChild(ApCreditListComponent) list: ApCreditListComponent;
  @Input() forEntity = '';
  @Input() vendorId = '';
  @Output() dataSelected = new EventEmitter<ApCredit[]>();

  state$: Observable<any>;

  action = 'list';
  loading = true;

  constructor(
    private store: Store<any>,
    private msg: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
   this.state$ = this.store.pipe(select('apCredit'));
  }

  ngOnInit() {
    if (this.forEntity === '') {
      let apCreditId = '';
      this.route.params.subscribe(params => {
        apCreditId = params.apCreditId;
      });
      this.route.url.subscribe((url) => {
        if (url.length === 0) {
          this.store.dispatch(new ApCreditActions.EditEnd());
        } else {
          if (url[0].path === 'create') {
            this.createInit();
          } else if (url[0].path === 'update' && apCreditId) {
            this.editInit(apCreditId);
          }
        }
        console.log(url);
      });
    }
  }

  create() {
    this.router.navigate(['ap-credit/create']);
  }

  createInit() {
    this.store.dispatch(new ApCreditActions.EditStart());
  }

  editInit(id) {
    this.store.dispatch(new ApCreditActions.EditStart(id));
  }

  backToList() {
    this.store.dispatch(new ApCreditActions.EditEnd());
    this.router.navigate(['ap-credit']);
  }

  backToEntity() {
    const selectedId = this.list.selection.selected.map(obj => {
      return {
        id: obj.id
      };
    });
    let data: ApCredit[] = [];
    if (selectedId.length > 0) {
      this.state$.pipe(take(1)).subscribe(
        s => data = s.list
      );
      data = data.filter(credit => {
        let selected = false;
        selectedId.forEach(si => {
          if (!selected && si.id === credit.id && credit.balance > 0) {
            selected = true;
          }
        });
        return selected;
      });
    }
    this.dataSelected.emit(data);
  }

  deleteSelectedData() {
    this.list.deleteSelected();
  }

  clearFilters() {
    this.list.clearFilters();
  }

}
