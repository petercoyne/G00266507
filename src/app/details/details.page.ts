import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  detail = [];

  constructor(private storage:Storage) { }

  ngOnInit() {
    this.storage.get("details")
    .then((data)=>{
      this.detail = JSON.parse(data);
      console.log(this.detail);
    })
    .catch(()=>{
      console.log("Something went wrong in get detail");
    });
    
  }

}
