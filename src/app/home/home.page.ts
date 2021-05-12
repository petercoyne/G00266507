import { Component, OnInit } from '@angular/core';
import { OpendataService } from '../opendata.service';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { default as Counties } from '../counties'; // import list of counties

import * as Leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  counties = Counties; // assign counties array to variable

  Results:any = [];
  county:string;
  recordType:number;
  activeID:number;
  loading:boolean;

  map:Leaflet.Map;
  markers = [];
  lat:any;
  lon:any;

  constructor(private opendata:OpendataService, private storage:Storage, public navCtrl: NavController, private geolocation: Geolocation) {}

  ngOnInit() {
    this.storage.get("county")
    .then((data)=>{
      this.county = data;
    })
    .catch(()=>{
      console.log("Something went wrong in get county");
    });
    
    this.storage.get("recordType")
    .then((data)=>{
      this.recordType = data;
    })
    .catch(()=>{
      console.log("Something went wrong in get recordType");
    });

    this.updateListings();
    this.leafletMap();
    this.GPS();
  }

  ngAfterViewChecked() {
    this.map.invalidateSize(); // map doesn't detect size initially, need to trigger the resize function
  }

  ngOnDestroy() {

  }

  toggleDetails(i, result) {
    if (this.activeID == i) {
      this.activeID = -1;
      let group = new Leaflet.featureGroup(this.markers)
      this.map.flyToBounds(group.getBounds());
    } else {
      this.activeID = i;
      this.zoomTo(result.geo.latitude, result.geo.longitude);
    }
  }

  zoomTo(lat, lng) {
    this.map.flyTo([lat, lng], 14);
  }

  setListings() {
    this.storage.set("county",this.county);
    this.storage.set("recordType",this.recordType);
    this.updateListings();
  }

  setRecordType(record: number) {
    this.recordType = record;
    this.setListings();
  }

  updateListings() {
    if (this.county && this.recordType) {
      this.loading = true;
      this.opendata.GetData(this.county, this.recordType).subscribe(
        (data)=>{
          this.Results = data.results;
          console.log(this.Results);
          this.placeMarkers(this.Results);
          this.map.invalidateSize();
          this.activeID = -1;
          this.loading = false;
        }
      )
    }
  }

  placeMarkers(results) {
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker);
      marker.remove();
    });
    this.markers = [];
    results.forEach(result => {
      this.markers.push(Leaflet.marker([result.geo.latitude, result.geo.longitude]).addTo(this.map));
    });
    //var bounds = Leaflet.latLngBounds(this.markers);
    let group = new Leaflet.featureGroup(this.markers)
    this.map.fitBounds(group.getBounds());

  }

  isSelected(tab: number): boolean {
    if (this.recordType == tab) {
      return true;
    } else {
      return false;
    }
  }

  leafletMap() {
    this.map = Leaflet.map('mapID').setView([53.1424, -7.6921], 6);

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Leaflet.marker([53.1424, -7.6921]).addTo(this.map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();
  }

  viewDetails(result) {
    console.log(result);
    this.storage.set("details",JSON.stringify(result));
    this.navCtrl.navigateForward('/details')
  }

  GPS() {
    this.geolocation.getCurrentPosition()
    .then((resp) => {
      this.lat = resp.coords.latitude;
      this.lon = resp.coords.longitude;
      Leaflet.marker([this.lat, this.lon]).addTo(this.map)
    })
    .catch((error) => {
       console.log('Error getting location', error);
    });
  }

}
