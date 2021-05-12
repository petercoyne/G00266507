import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

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
