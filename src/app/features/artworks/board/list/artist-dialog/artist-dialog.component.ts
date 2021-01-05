import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Artwork } from 'app/models';
import { ArtworksService } from 'app/core/services/artworks.service';
import { ApiService } from 'app/core/services/api.service';
import { Subscription, Observable } from 'rxjs';
import { displayName } from '../../../utils';
import { switchMap, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-artist-dialog',
  templateUrl: './artist-dialog.component.html',
  styleUrls: ['./artist-dialog.component.scss']
})

export class ArtistDialogComponent implements OnInit {
  
  dialogTitle: string;
  artist: string;
  artistForm: FormGroup;
  filteredAssignees: Observable<any[]>;
  @Input() artwork: Artwork;
  displayName = displayName;
  constructor(
    public dialogRef: MatDialogRef<ArtistDialogComponent>,
    private service: ArtworksService,
    private api: ApiService,
    private msg: MessageService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) { 
      this.dialogTitle = data.dialogTitle;
      this.artwork = data.artwork;
      this.artist = data.artist;
    this.initForm();
    }

  ngOnInit() {
    this.initForm();
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.artistForm.patchValue({
      assignedId: assignee.id,
      assignee: assignee.name
    });
  }

  updateArtwork() 
  {
   
    if(Object.keys(this.artwork).length === 0) {
      
     let assignee = {assignee: this.artistForm.value.assignee, assignedId: this.artistForm.value.assignedId, estimated: this.artistForm.value.estimated}
     if(assignee.assignedId === "" || assignee.assignedId === null) {
      this.msg.show("Please select assignee", "error");
      return;
    }
      this.service.assignSelectedArtworks(assignee)
            .subscribe((data) => {
                  this.dialogRef.close(data);
              })
    } else {
      this.artwork.estimated = this.artistForm.value.estimated;
      this.artwork.assignedId = this.artistForm.value.assignedId;
      this.artwork.assignee = this.artistForm.value.assignee;
      this.service.updateArtwork(this.artwork)
          .subscribe((data) => {
                this.dialogRef.close(data);
            })
    }
  }

  initForm() {

    this.artistForm = this.fb.group({
      estimated                 : [this.artwork.estimated],
      assignedId                : [this.artwork.assignedId],
      assignee                  : [this.artwork.assignee]
    });

    this.filteredAssignees = 
      this.autoCompleteWith('assignee', val => 
        this.api.getUserAutocomplete(val)
      );

  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.artistForm.get(field).valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(func),
    );
  }

}
