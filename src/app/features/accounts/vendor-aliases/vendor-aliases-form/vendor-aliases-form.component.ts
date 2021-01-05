import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { IVendorAlias } from '../vendor-aliases-resources/vendor-alias-interface';
import { VendorsService } from '../vendor-aliases-resources/vendors.service';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { map, startWith,debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'vendor-aliases-form',
  templateUrl: './vendor-aliases-form.component.html',
    styleUrls: ['./vendor-aliases-form.component.css'],
    animations: fuseAnimations
})
export class VendorAliasesFormComponent implements OnInit {

    public vendorForm: FormGroup;
    public vendorData = [];
    public aliasList: Array<any>;
    public newAliasText: string = '';
    public aliasError: boolean = false;
    private editName: string = null;

    constructor(
        private formBuilder: FormBuilder,
        private vendorsService: VendorsService,
        private router: Router,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private auth: AuthService) { }

    ngOnInit() {

        this.editName = this.activatedRoute.snapshot.paramMap.get('name');
        let builder = null;
        this.aliasList = [];
        if (this.editName === null) {
            builder = {
                'name': ['', Validators.required],
                'aliases': [''],
                'alias': ['']
            }

        }
        else {
            builder = {
                'name': [{ value:this.editName, disabled: true}],
                'aliases': [''],
                'alias': ['']
            }
            this.processData();

        }
        this.vendorForm = this.formBuilder.group(builder);
        this.aliasList = [];
        this.vendorForm.controls.name.valueChanges.subscribe(val => {
            this.loadData(this.vendorForm.value.name);
        });
    }
    processData = async function () { 
        this.loading = true;
        let list = await this.vendorsService.getAliases(this.editName);
        if (this.aliasList.length > 0)
            return;
        this.aliasList = [];
        for (let i = 0; i < list.length; i++) {
            this.aliasList.unshift({
                text: list[i]
            });
        }
        this.loading = false;
    }
    loadData = async function (vendor: string) {

        if (vendor === null || vendor === "") {
            this.vendorData = [];
            return;
        }
        this.vendorData = await this.vendorsService.getVendors(vendor);
    }


    public getNotDeleted = function() {
        return this.aliasList.filter((item: any) => {
            return !item.deleted
        })
    }

    public addAliasItem = function($event) {
        if (($event.which === 1 || $event.which === 13) && this.newAliasText.trim() != '') {
            this.aliasList.unshift({
                text: this.newAliasText
            });
            this.newAliasText = '';
        }

    }
    public newVendor = async function () {
        this.aliasError = false;
        if (!this.vendorForm.value) {
            return false;
        }
        let activeAliasList = this.getNotDeleted();
        let postALiasList = [];
        for (let i = 0; i < activeAliasList.length; i++)
            postALiasList.push(activeAliasList[i].text);
        this.vendorForm.controls.aliases.setValue(postALiasList);
        this.loading = true;
        await this.vendorsService.saveAliases(this.vendorForm.getRawValue());
        this.router.navigate([`/accounts/vendor/aliases/success`]);

    }

}
