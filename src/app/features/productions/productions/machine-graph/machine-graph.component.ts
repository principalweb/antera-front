import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ProductionsService } from 'app/core/services/productions.service';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';

@Component({
    selector: 'machine-graph',
    templateUrl: './machine-graph.component.html',
    styleUrls: ['./machine-graph.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class MachineGraphComponent implements OnInit {
    data: any[];
    scheme: any = {
        domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
    }

    machineGraphSubscription: Subscription; 

    constructor(
        private prodService: ProductionsService
    ) { }

    ngOnInit() {
        this.machineGraphSubscription = this.prodService.onMachineGraphChanged.subscribe((res: any[]) => {
            this.data = res;
        });

        this.prodService.getMachineGraph().subscribe();
    }

    ngOnDestroy() {
        this.machineGraphSubscription.unsubscribe();
    }

    selectEv($event) {
    }
}
