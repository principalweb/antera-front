import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { DropdownService } from '../dropdown.service';
import { MatDialog } from '@angular/material/dialog';
import { DropdownOption } from 'app/models/dropdown-option';
import { DropdownOptionFormComponent } from '../dropdown-option-form/dropdown-option-form.component';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements OnInit {
  
  onDropdownOptionsChangedSubscription: Subscription;
  dropdown: any;
  dialogRef: any;
  loading = false; 

  constructor(
    private dropdownService: DropdownService,
    public dialog: MatDialog,
    private msg: MessageService
  ) 
  {}

  ngOnInit() {
    this.onDropdownOptionsChangedSubscription = 
      this.dropdownService.onDropdownOptionsChanged
        .subscribe(response => {
          this.dropdown = response[0];
          console.log(this.dropdown);
        });
  }

  ngOnDestroy() {
    this.onDropdownOptionsChangedSubscription.unsubscribe();
  }

  newOption() {
    if(this.dropdown.readOnly == '1'){
        this.msg.show('You are not allowed to create new entry, Please contact administrator.', 'error');
        return;
    }
    this.dialogRef = this.dialog.open(DropdownOptionFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new',
          name: this.dropdown.name,
          readOnly: this.dropdown.readOnly
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((dropdownOption: DropdownOption) => {
          if ( !dropdownOption ) return;
          this.loading = true;
          const data = {
            name: this.dropdown.name,
            options: [dropdownOption.toObject()]
          }
          this.dropdownService.createDropdownOption(data)
            .subscribe(() => {
              this.msg.show('New Option created successfully', 'success');
              this.loading = false;
            }, err => {
              this.msg.show('Error occurred creating a Dropdown Option', 'error');
              this.loading = false;
            });
      });
  }

  editDropdown(option) {
    if(this.dropdown.readOnly == '1'){
        this.msg.show('You are not allowed to edit any entry, Please contact administrator.', 'error');
        return;
    }
    if(option.readOnly == '1'){
        this.msg.show('You are not allowed to edit this entry, Please contact administrator.', 'error');
        return;
    }
    const dropdownOption = new DropdownOption(option);
    this.dialogRef = this.dialog.open(DropdownOptionFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'edit',
          name: this.dropdown.name,
          dropdownOption: dropdownOption,
          readOnly: this.dropdown.readOnly
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((dropdownOption: DropdownOption) => {
          if ( !dropdownOption ) return;
          this.loading = true;
          const data = {
            name: this.dropdown.name,
            options: [dropdownOption.toObject()]
          }
          this.dropdownService.updateDropdownOption(data)
            .subscribe(() => {
              this.msg.show('Dropdown Option updated successfully', 'success');
              this.loading = false;
            }, err => {
              this.msg.show('Error occurred updating a Dropdown Option', 'error');
              this.loading = false;
            });
      });
  }

  deleteDropdown(option) {
    if(this.dropdown.readOnly == '1'){
        this.msg.show('You are not allowed to remove any entry, Please contact administrator.', 'error');
        return;
    }
    this.loading = true;
    this.dropdownService.deleteDropdownOption({dropdownIds: [option.id]})
    .subscribe(() => {
      this.msg.show('Dropdown Option deleted successfully', 'success');
      this.loading = false;
    }, err => {
      this.msg.show('Error occurred deleting a Dropdown Option', 'error');
      this.loading = false;
    });
  }
}
