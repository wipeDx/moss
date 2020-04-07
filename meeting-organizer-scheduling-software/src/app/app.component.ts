import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { slideInAnimation } from "./animations";
import { TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ slideInAnimation ]
})
export class AppComponent {
  title = 'MOSS - Meeting Organizer Scheduling Software';

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'de']);
    // fallback language
    translate.setDefaultLang('en');
    translate.use('en');
  }

}
