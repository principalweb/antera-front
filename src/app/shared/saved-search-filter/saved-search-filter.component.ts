import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { SavedSearchService } from 'app/core/services/saved-search.service';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'saved-search-filter',
  templateUrl: './saved-search-filter.component.html',
  styleUrls: ['./saved-search-filter.component.scss'],
  animations: fuseAnimations
})
export class SavedSearchFilterComponent implements OnInit, OnDestroy {
  @Input() left = "";
  @Input() module = '';
  @Output() onSave = new EventEmitter();
  @Output() onLoad = new EventEmitter();
  savedList = [];
  name = '';
  visible = false;
  canClickoutside = false;

  subscriptions: Subscription[] = [];

  constructor(
    public service: SavedSearchService,
    private msg: MessageService,
    private eRef: ElementRef,
    private auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.service.savedSearches.subscribe((savedSearches: any) => {
        this.savedList = Object.keys(savedSearches[this.module] || {});
      })
    );

    this.subscriptions.push(
      this.service.filterVisible.subscribe(v => {
        this.visible = v;
        if (v) {
          setTimeout(() => {
            this.canClickoutside = true;
          })
        } else {
          this.canClickoutside = false;
        }
      })
    );

    this.loadSearchForModule();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  save() {
    if (!this.name) {
      this.msg.show('Please enter search name', 'error');
      return;
    }

    this.onSave.next(this.name);
    this.name = '';
  }

  loadSearchForModule() {
    const user = this.auth.getCurrentUser();

    let data = {
      userId: user.userId,
      module: this.module
    };

    this.api.getSavedSearches(data)
      .subscribe((list: any[]) => {
        const obj: any = {};
        list.forEach(search => {
          obj[search.setting] = JSON.parse(search.value)
        });
        this.service.setSearchesForModule('workflow', obj);
      });
  }

  clickItem(name) {
    const filter = this.service.loadSearch(this.module, name);
    this.onLoad.next(filter);
    this.service.setVisibility(false);
    this.name = name;
  }

  deleteItem(name) {
    const user = this.auth.getCurrentUser();

    let data = {
      userId: user.userId,
      module: this.module,
      setting: name
    };

    this.api.deleteSavedSearch(data)
      .subscribe((res: any) => {
        if (res == 1) {
          this.msg.show('A saved search deleted successfully.','success');
          this.loadSearchForModule();
        }
        else {
          this.msg.show('Error occured while deleting the saved search','error');
        }
      }, () => {
        this.msg.show('Server connection error', 'error');
      });
  }

  editItem(name) {
    const filter = this.service.loadSearch(this.module, name);
    this.onLoad.next(filter);
    this.service.setVisibility(false);
    this.name = name;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if(this.canClickoutside && !this.eRef.nativeElement.contains(event.target)) {
      this.service.setVisibility(false);
    }
  }
}
