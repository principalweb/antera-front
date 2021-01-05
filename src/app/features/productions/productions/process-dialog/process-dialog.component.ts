import { Component, Inject, ViewEncapsulation, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { ProductionProcess } from 'app/models/production-process';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-process-dialog',
    templateUrl: './process-dialog.component.html',
    styleUrls: ['./process-dialog.component.scss']
})
export class ProcessDialogComponent implements OnInit, OnDestroy {

    newProcess = new ProductionProcess();
    decoTypes: any;
    processList: ProductionProcess[] = [];
    dataSource = new MatTableDataSource(this.processList);
    displayedColumns: string[] = ['name', 'decoTypeName', 'additionalTime', 'delete'];
    constructor(
        private prodService: ProductionsService,
        public dialogRef: MatDialogRef<ProcessDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public msg: MessageService
    ) { }

    onProcessChangedSubscription: Subscription;

    ngOnInit() {
        this.onProcessChangedSubscription = this.prodService.onProcessChanged.subscribe((res: ProductionProcess[]) => {
            this.dataSource.data = res;
        });

        this.prodService.getAllDesignTypes().subscribe(res => {
            this.decoTypes = res;
        });

        this.getProcesses();
    }

    ngOnDestroy() {
        this.onProcessChangedSubscription.unsubscribe();
    }

    close() {
        this.dialogRef.close();
    }

    clearNewProcess() {
        this.newProcess = new ProductionProcess();
    }

    add() {
        console.log(this.newProcess);
        this.prodService.createProcess(this.newProcess).subscribe((res) => {
            this.getProcesses();
        });
    }

    getProcesses() {
        this.prodService.getProcesses().subscribe();
    }

    update(proc) {
        this.prodService.updateProcess(proc).subscribe((res:any) => {
            console.log(res);
            this.msg.show(res.msg, res.status);
            this.getProcesses();
        });
    }

    delete(proc) {
        this.prodService.deleteProcess(proc.id).subscribe((res) => {
            this.getProcesses();
        });
    }
}
