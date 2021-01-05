import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class MessageService {

  constructor(private snackBar: MatSnackBar) { }

  show(msg, type, vposition: any = 'bottom') {
    this.snackBar.open(msg, '', {
      panelClass: `msg-${type}`,
      horizontalPosition: 'center',
      verticalPosition: vposition,
      duration: 5000
    });
  }
}
