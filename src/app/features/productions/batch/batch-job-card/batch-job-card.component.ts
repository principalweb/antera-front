import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { Production } from 'app/models/production';

@Component({
  selector: 'batch-job-card',
  templateUrl: './batch-job-card.component.html',
  styleUrls: ['./batch-job-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BatchJobCardComponent implements OnInit {

    @Input() job: Production;
    showJobs: boolean = false;
    customerNames: string = "";

    constructor(
        private service: ProductionsService,
        private msg: MessageService
    ) { }

    ngOnInit() {
        this.customersToString();
    }

    dropJob(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            this.service.addToBatch(this.job, event.item.data).subscribe(
                (res: any) => {
                    this.msg.show(res.msg, 'info');
                    transferArrayItem(event.previousContainer.data,
                                event.container.data,
                                event.previousIndex,
                                event.currentIndex);
                    this.service.getProductions().subscribe(() => {
                            this.customersToString();
                        }
                    );

                    this.service.refreshVariationFilter().subscribe();
                   
                },
                (err: any) => {
                    this.msg.show(err.error.data, 'error');
                }
            );
        }
    }

    toggle() {
        this.showJobs = !this.showJobs;
    }

    customersToString() {
        let customers = this.job.batchJobs.map(item => item.customerName);
        let uniq = Array.from(new Set(customers));
        this.customerNames = uniq.join(', ');
    }
}
