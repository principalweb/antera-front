import { Component, ViewEncapsulation, OnInit }  from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector: 'app-pause-dialog',
    templateUrl: './pause-dialog.component.html',
    styleUrls: ['./pause-dialog.component.scss'],
})
export class PauseDialogComponent implements OnInit {

    ddPaused: any =  [];
    selected: any;

    constructor(
        private prodService: ProductionsService,
        public dialogRef: MatDialogRef<PauseDialogComponent>,
        public msg: MessageService
    ) { }

    ngOnInit() {
        // prodService.ddPaused initialized with main production component

        this.prodService.getPausedDropdown().subscribe((res: any) => {
            this.ddPaused = res;
        });

    }

    close() {
        this.dialogRef.close(this.selected);
    }
}
