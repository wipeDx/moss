import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-full-page-loading-spinner',
  templateUrl: './full-page-loading-spinner.component.html',
  styleUrls: ['./full-page-loading-spinner.component.css']
})
export class FullPageLoadingSpinnerComponent implements OnInit {

  @Input() loading: boolean;

  constructor() { }

  ngOnInit() {
  }

}
