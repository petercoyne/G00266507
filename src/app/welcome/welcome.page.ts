import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage {

  // Very simple script, see home.page.ts for the meat of the app

  constructor(public navCtrl: NavController) { }

  openApp() {
    this.navCtrl.navigateForward('/home');
  }

  openAbout() {
    this.navCtrl.navigateForward('/about');
  }

  openDetails() {
    this.navCtrl.navigateForward('/details');
  }

}
