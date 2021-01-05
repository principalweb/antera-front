import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromAnteraProductRepo from '../store/antera-product-repo.reducer';
import * as AnteraProductRepoActions from '../store/antera-product-repo.actions';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'antera-product-repo-form',
  templateUrl: './antera-product-repo-form.component.html',
  styleUrls: ['./antera-product-repo-form.component.scss']
})
export class AnteraProductRepoFormComponent implements OnInit {
  dataForm: FormGroup;

  constructor(
    private store: Store<any>,
    private fb: FormBuilder,
  ) {
    // TODO test state is working fine
      this.store.pipe(select('anteraProductRepo'))
      .subscribe((data) => {
        this.dataForm = this.fb.group({...data.data});
     });
  }

  ngOnInit() {
  }

  save() {
    this.store.dispatch(new AnteraProductRepoActions.EditStart());
  }

}
