import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

    @Input() group: FormGroup;
    @Input() field = '';
    @Input() label = '';

    constructor() { }

    ngOnInit() {
    }

}
