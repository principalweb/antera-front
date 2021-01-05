import { Component, OnInit, EventEmitter, ViewChild, Input } from '@angular/core';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CxmlPoLogListComponent } from './cxml-po-log-list/cxml-po-log-list.component';

import * as fromCxmlPoLog from './store/cxml-po-log.reducer';
import * as CxmlPoLogActions from './store/cxml-po-log.actions';

@Component({
  selector: 'cxml-po-log',
  templateUrl: './cxml-po-log.component.html',
  styleUrls: ['./cxml-po-log.component.scss'],
  animations: fuseAnimations
})
export class CxmlPoLogComponent implements OnInit {
  @ViewChild(CxmlPoLogListComponent) list: CxmlPoLogListComponent;
  @Input() forEntity = '';
  // @Output() dataSelected = new EventEmitter<CxmlPoLog[]>();

  state$: Observable<fromCxmlPoLog.State>;

  action = 'list';
  loading = true;

  constructor(
    private store: Store<fromCxmlPoLog.State>,
    private msg: MessageService,
  ) {
    // TODO test state is working fine
    this.state$ = this.store.pipe(select((state: fromCxmlPoLog.State) => state));
  }

  ngOnInit() {
  }

  create() {
    this.store.dispatch(new CxmlPoLogActions.EditStart());
  }

  backToList() {
    this.store.dispatch(new CxmlPoLogActions.EditEnd());
  }

  backToEntity() {
    // const selectedId = this.list.selection.selected.map(obj => {
    //   return {
    //     id: obj.id
    //   };
    // });
    // let data: CxmlPoLog[] = [];
    // if (selectedId.length > 0) {
    //   this.state$.pipe(take(1)).subscribe(
    //     s => data = s.list
    //   );
    //   data = data.filter(rd => {
    //     let selected = false;
    //     selectedId.forEach(si => {
    //       if (!selected && si.id === rd.id) {
    //         selected = true;
    //       }
    //     });
    //     return selected;
    //   });
    // }
    // this.dataSelected.emit(data);
  }

  deleteSelectedData() {
    // this.dataList.deleteSelected();
  }

  clearFilters() {
    // this.dataList.clearFilters();
  }

}
