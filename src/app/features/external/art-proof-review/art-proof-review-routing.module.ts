import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewOrderProofsComponent } from './review-order-proofs/review-order-proofs.component';
import { ArtProofResolverService } from './art-proof-resolver.service';

const routes: Routes = [
  {
    path: ':id',
    component: ReviewOrderProofsComponent,
    resolve: {
      data: ArtProofResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtProofReviewRoutingModule { }
