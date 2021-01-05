import { Component, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';

import { TeamMember } from '../models';
import { sampleMembers } from '../mock';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [ fuseAnimations ]
})
export class TeamMembersComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayColumns = ['checkbox', 'avatar', 'name', 'position', 'office', 'email', 'phone', 'actions'];

  dataSource: MatTableDataSource<TeamMember>;
  members = sampleMembers;

  checkboxes = {};
  selectedCount = 0;

  searchInput = new FormControl('');

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<any>(sampleMembers);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(searchText => {

    });
  }

  onSelectedChange(contactId) {
    const checks = Object.values(this.checkboxes);

    let count = 0;
    checks.forEach(checked => {
      if (checked) {
        count ++;
      }
    });

    this.selectedCount = count;
  }

  toggleAll(ev) {
    if (ev) {
      if (this.selectedCount === this.dataSource.data.length) {
        this.dataSource.data.map(item => {
          this.checkboxes[item.id] = false;
        });
        this.selectedCount = 0;
      } else {
        this.dataSource.data.map(item => {
          this.checkboxes[item.id] = true;
        });
        this.selectedCount = this.dataSource.data.length;
      }
    }
  }

  clearSearch(){
    if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
  }

  emailSelected(){
    this.dialog.open(ComingSoonComponent);
  }

  massUpdateSelected(){
    this.dialog.open(ComingSoonComponent);
  }

  mergeSelected(){
    this.dialog.open(ComingSoonComponent);
  }

  addToTargetListSelected(){
    this.dialog.open(ComingSoonComponent);
  }

  generateLetterSelected(){
    this.dialog.open(ComingSoonComponent);
  }
}
