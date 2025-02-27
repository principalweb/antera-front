import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileManagerComponent } from './file-manager.component';

const routes: Routes = [{
  path     : '',
  component: FileManagerComponent,
  data: {
      helpModule: 'File Manager',
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
