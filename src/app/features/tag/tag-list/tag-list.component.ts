import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { TagService } from 'app/core/services/tag.service';
import { Tag } from 'app/models/tag';
import { delay } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { TagModuleFormComponent } from '../tag-module-form/tag-module-form.component';
import { TagStoreFormComponent } from '../tag-store-form/tag-store-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class TagListComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'url', 'module', 'enabled'];
  onTotalCountChanged: Subscription;
  dataSource: TagDataSource | null;
  selection = new SelectionModel<Tag>(true, []);
  payload = {
    "offset": 0,
    "limit": 50,
    "order": "name",
    "orient": "asc",
    "id": "",
    "term": {
        "name": "",
        "enabled": ""
    }
  };
  loading: boolean = false;
  moduleFormDialogRef: MatDialogRef<TagModuleFormComponent>;
  storeFormDialogRef: MatDialogRef<TagStoreFormComponent>; 

  constructor(
    private tagService: TagService,
    private msg: MessageService,
    public dialog: MatDialog
  ) {

    this.onTotalCountChanged =
        this.tagService.onTagListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });
    this.loadData();
  }

  ngOnInit(): void {
    this.dataSource = new TagDataSource(
      this.tagService
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  deleteSelected() {
    const selectedId = this.selection.selected.map(obj => { return obj.id });
    if(selectedId.length > 0) {
      this.loading = true;
      this.tagService.removeTags(selectedId)
      .subscribe((response: any) => {
          this.loading = false;
          this.loadData();
          this.msg.show(response.msg, response.err);
      }, err => {
          this.loading = false;
          this.msg.show(err.message, 'error');
      });;
    }
  }

  loadData() {
    this.tagService.getTagCount(this.payload);                                                                                                                                                                                                                                                                            
    this.tagService.getTagList(this.payload);
  }                                                                                                               

  paginate(ev) {
    this.payload.offset = ev.pageIndex;
    this.payload.limit = ev.pageSize;
    this.loadData();
  }

  showTagDetail(data) {
    if(data.tagType === 'Module Tag') {
      this.moduleFormDialogRef = this.dialog.open(TagModuleFormComponent, {
        panelClass: 'app-tag-module-form',
        data: data 
      });
      this.moduleFormDialogRef.afterClosed()
          .subscribe((response) => {
              this.loadData();
          });
    } else {
      this.storeFormDialogRef = this.dialog.open(TagStoreFormComponent, {
        panelClass: 'app-tag-store-form',
        data: data 
      });
      this.storeFormDialogRef.afterClosed()
          .subscribe((response) => {
              this.loadData();
          });
      }
  }
}


export class TagDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private tagService  : TagService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Tag[]>
    {
        const displayDataChanges = [
            this.tagService.onTagListChanged
        ];

        this.onTotalCountChanged =
            this.tagService.onTagListCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
              console.log("total",total);
                this.total = total;
            });

        this.onListChanged =
            this.tagService.onTagListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.tagService.onTagListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}
