import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invitation-dialog',
  templateUrl: './invitation-dialog.component.html',
  styleUrl: './invitation-dialog.component.css',
  standalone: false
})
export class InvitationDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { invitationCode: string },
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) { }

  copyToClipboard(text: string, confirmationMessage: string): void {
    if (this.clipboard.copy(text)) {
      this.snackBar.open(confirmationMessage, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
