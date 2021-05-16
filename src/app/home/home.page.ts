import { Component, OnInit } from '@angular/core';
import { OpendataService } from '../opendata.service';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { default as Counties } from '../counties'; // import list of counties

import * as Leaflet from 'leaflet'; // Leaflet is our maps library
import { icon, Marker } from 'leaflet';

import { Geolocation } from '@ionic-native/geolocation/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  counties = Counties; // assign imported counties array to variable

  Results:any = []; // array to house our API results
  county:string; // active county
  recordType:number; // active tab
  activeID:number; // active item in results
  loading:boolean; // is the page waiting on API call?

  map:Leaflet.Map;
  markers = []; // array for the active set of map markers
  lat:any; // latitude of user
  lon:any; // longitude of user

  // using OpenData
  constructor(private opendata:OpendataService, private storage:Storage, public navCtrl: NavController, private geolocation: Geolocation) {}

  ngOnInit() {

    // fetching last selected county from storage
    this.storage.get("county")
    .then((data)=>{
      this.county = data;
    })
    .catch(()=>{
      console.log("Something went wrong in get county");
    });
    
    // fetching active tab from storage
    this.storage.get("recordType")
    .then((data)=>{
      this.recordType = data;
    })
    .catch(()=>{
      console.log("Something went wrong in get recordType");
    });

    // Bugfix for Leaflet marker urls https://stackoverflow.com/questions/41144319/leaflet-marker-not-found-production-env
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28], 
      shadowSize: [41, 41]
    });
    Marker.prototype.options.icon = iconDefault;
    // end bugfix

    // updateListings will not fire before storage call returns, could use two ready variables and a timer maybe?
    // this.updateListings();

    // init map 
    this.leafletMap();
    // place user on map
    this.GPS();
  }

  // one of the later lifecycle hooks
  ngAfterViewChecked() {
    this.map.invalidateSize(); // map doesn't detect size initially, need to trigger the resize function
  }

  // should maybe clean up the map here
  ngOnDestroy() {

  }

  // called when user taps on an item in the list
  toggleDetails(i, result) { // i is position in array, result is a result object
    if (this.activeID == i) { // user tapped on the active item
      this.activeID = -1; // unset active item
      let group = new Leaflet.featureGroup(this.markers) // grab the previous county markers
      this.map.flyToBounds(group.getBounds()); // fly to encompass them
    } else { // else we tapped on an inactive item
      this.activeID = i;
      this.zoomTo(result.geo.latitude, result.geo.longitude);
    }
  }

  zoomTo(lat, lng) {
    this.map.flyTo([lat, lng], 14);
  }

  // user selected a county
  setListings() {
    this.storage.set("county",this.county);
    this.storage.set("recordType",this.recordType);
    this.updateListings();
  }

  // user selected a tab
  setRecordType(record: number) {
    this.recordType = record;
    this.storage.set("recordType",record);
    this.updateListings();
  }

  // called on changing county or tab
  updateListings() {
    if (this.county && this.recordType) { // make sure we have a valid county and tab
      this.loading = true; // display our loading spinner
      this.opendata.GetData(this.county, this.recordType).subscribe( // using our service to get data from API
        (data)=>{
          this.Results = data.results;
          this.placeMarkers(this.Results); // place markers on map
          this.map.invalidateSize(); // recheck map size just in case
          this.activeID = -1; // reset active list item
          this.loading = false; // loading is done
        }
      )
    }
  }

  placeMarkers(results) {
    // clear out the old markers
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker);
      marker.remove();
    });
    this.markers = [];

    // iterate through results, place markers at coordinates, add to map, and add to markers array
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

    // init map of ireland
    this.map = Leaflet.map('mapID').setView([53.1424, -7.6921], 6);

    // attribution
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Leaflet.marker([53.1424, -7.6921]).addTo(this.map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();
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
