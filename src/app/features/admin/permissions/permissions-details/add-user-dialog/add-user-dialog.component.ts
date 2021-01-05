import { Component, Inject } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { switchMap, startWith, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {

    userCtrl = new FormControl();
    filteredUsers: Observable<Object>;
    userList:  any[];
    selectedUser: any;

    constructor(
        public dialogRef: MatDialogRef<AddUserDialogComponent>,
        private api: ApiService
    ) {}


    cancelClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
        this.filteredUsers = this.userCtrl.valueChanges.pipe(
            debounceTime(500),
            switchMap(term => { return this.api.getUserAutocomplete(term) })
        );
    }

    displayFn(user?):string | undefined {
        return user ? user.name : undefined;
    }
}
