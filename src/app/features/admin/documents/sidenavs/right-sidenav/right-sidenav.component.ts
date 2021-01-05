import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';


@Component({
    selector   : 'templates-main-sidenav',
    templateUrl: './right-sidenav.component.html',
    styleUrls  : ['./right-sidenav.component.scss'],
    animations : fuseAnimations
})
export class TemplatesMainSidenavComponent implements OnInit, OnDestroy
{
    @Output() templateChanged = new EventEmitter();

    templates = [
        {
            'id'  : 1,
            'url' : 'assets/images/templates/template1.png',
            'name': 'Template 1'
        },
        {
            'id'  : 2,
            'url' : 'assets/images/templates/template2.png',
            'name': 'Template 2'
        },
        {
            'id'  : 3,
            'url' : 'assets/images/templates/template3.png',
            'name': 'Template 3'
        },
        {
            'id'  : 4,
            'url' : 'assets/images/templates/template4.png',
            'name': 'Template 4'
        },
        {
            'id'  : 5,
            'url' : 'assets/images/templates/template5.png',
            'name': 'Template 5'
        }];

    constructor(

    )
    {
    }

    ngOnInit()
    {

    }

    ngOnDestroy()
    {
    }

    selectTemplate(template, ev){
        if (template.id == 1)
            this.templateChanged.emit(template);
    }
    
}
