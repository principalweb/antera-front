import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector   : 'fuse-scrumboard-board-edit-list-name',
    templateUrl: './edit-list-name.component.html',
    styleUrls  : ['./edit-list-name.component.scss']
})
export class FuseScrumboardBoardEditListNameComponent
{
    formActive = false;
    form: FormGroup;
    @Input() status:any = {};
    @Input() total = 0;
    @Output() onNameChanged = new EventEmitter();
    @Output() remove = new EventEmitter();
    @ViewChild('nameInput') nameInputField;

    constructor(
        private formBuilder: FormBuilder
    )
    {
    }

    openForm()
    {
        this.form = this.formBuilder.group({
            name: this.status.label
        });
        this.formActive = true;
        this.focusNameField();
    }

    closeForm()
    {
        this.formActive = false;
    }

    focusNameField()
    {
        setTimeout(() => {
            this.nameInputField.nativeElement.focus();
        });
    }

    onFormSubmit()
    {
        if ( this.form.valid && this.form.value.name !== this.status.label )
        {
            this.onNameChanged.next({
                id: this.status.id,
                label: this.form.value.name
            });
            this.formActive = false;
        }
    }

    removeList() {
        this.remove.emit();
    }

}
