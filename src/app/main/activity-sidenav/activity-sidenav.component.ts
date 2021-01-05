
import { Component, OnInit } from '@angular/core';
import { NoteService } from '../note.service';
import { Activity } from 'app/models';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'activity-sidenav',
  templateUrl: './activity-sidenav.component.html',
  styleUrls: ['./activity-sidenav.component.scss']
})
export class ActivitySidenavComponent implements OnInit {
  notes: Activity[];
  open: boolean = false;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(public noteService: NoteService) { }
  
  
  ngOnInit() {
    this.subscribeToNotes();
    this.subscribeToOpenStatus();
  }

  subscribeToNotes(){
    this.noteService.displayedActivites
    .pipe(takeUntil(this.destroyed$))
    .subscribe((notes: Activity[]) => {
      console.log("current notes", notes);
      this.notes = notes;
    });
  }

  subscribeToOpenStatus(){
    this.noteService.open
    .pipe(takeUntil(this.destroyed$))
    .subscribe((open: boolean) => {
      this.open = open;
      console.log("open from subs", open);
    });
  }



}
