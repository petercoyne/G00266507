import { Component, OnInit } from '@angular/core';
import { OpendataService } from '../opendata.service';
import { Storage } from '@ionic/storage';

import * as Leaflet from 'leaflet';
import { antPath } from 'leaflet-ant-path';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  Results:any = [];
  county:string;
  recordType:number;

  map:Leaflet.Map;

  markers = [];

  constructor(private opendata:OpendataService, private storage:Storage) {}

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
  }

  ngAfterViewChecked() {
    this.map.invalidateSize();
  }

  ngOnDestroy() {

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
    this.opendata.GetData(this.county, this.recordType).subscribe(
      (data)=>{
        this.Results = data.results;
        console.log(this.Results);
        this.placeMarkers(this.Results);
        this.map.invalidateSize();
      }
    )
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

}
