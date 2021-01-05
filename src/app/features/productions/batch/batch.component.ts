import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';

import { Production } from 'app/models/production';

@Component({
    selector: 'batch',
    templateUrl: './batch.component.html',
    styleUrls: ['./batch.component.scss']
})
export class BatchComponent implements OnInit {

    jobs: Production[];
    batchJobMasters: Production[];

    onProductionChanged: Subscription;

    constructor(
        private service: ProductionsService,
        private msgService: MessageService
    ) { }

    ngOnInit() {
        this.onProductionChanged = this.service.onProductionsChanged.subscribe((res: Production[]) => {
            this.jobs = res.filter(item => item.batchJob == false  && item.batchMaster == false)
            this.batchJobMasters = res.filter(item => item.batchMaster == true);
        });

        this.service.getProductions().subscribe();

        this.batchJobMasters = this.service.productions.filter(
            item => item.batchMaster == true
        );
    }

    ngOnDestroy() {
        this.onProductionChanged.unsubscribe();
    }

    addEmptyMaster() {
        let job = new Production();
        this.batchJobMasters.push(job);
    }

	drop(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            this.service.delFromBatch(event.item.data.id).subscribe(
                (res: any) => {
                  transferArrayItem(event.previousContainer.data,
                                    event.container.data,
                                    event.previousIndex,
                                    event.currentIndex);
                  this.service.getProductions().subscribe();
                  this.service.refreshVariationFilter().subscribe();
                },
                (err: any) => {}
            );
        }
	}
}
