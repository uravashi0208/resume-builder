// Full-screen CV viewer (opens when the preview is clicked) – dimmed backdrop, big crisp pages,
// scrollable, closes with the × button, Esc, or a click on the backdrop.
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-resume-viewer',
  templateUrl: './resume-viewer.component.html',
  styleUrls: ['./resume-viewer.component.css'],
})
export class ResumeViewerComponent implements OnInit, OnDestroy {
  @Input() profile!: Profile;
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void { document.body.style.overflow = 'hidden'; }
  ngOnDestroy(): void { document.body.style.overflow = ''; }

  @HostListener('document:keydown.escape') onEsc() { this.close(); }
  close() { this.closed.emit(); }
}
