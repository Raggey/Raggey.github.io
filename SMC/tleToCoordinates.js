/**
 * 
 * tle to coordinates conversion functions
 * tleToCoordinates.js
 *
 *
 * converts the TLE data to longitude and latitude data
 * 
 * Author: Craig Robinson (From satellite.js)
 * Last Modified date: 24/07/2019
 * 
 * Requirements: satellite.js 
 * 
 * Usage: 
 * Include package in html using: <script src="tleToCoordinates.js"></script>
 * use functions as required
 * 
 * Globals:
 * longLat = JSON of current longitude and latitude data
 * tleLine1,tleLine2 TLE data for the user defined TLE from NORAD  
*/

var longLat = {long:0, lat:0};
var tleLine1;
var tleLine2;
var azimuth1;
var elevation1;

function convertTLEtoCoordinates(tleLine1,tleLine2){

   // Initialize a satellite record
   var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

   //  Propagate satellite using time since epoch (in minutes).
   // var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

   //  Or you can use a JavaScript Date
   var positionAndVelocity = satellite.propagate(satrec, new Date());

   // The position_velocity result is a key-value pair of ECI coordinates.
   // These are the base results from which all other coordinates are derived.
   var positionEci = positionAndVelocity.position,
       velocityEci = positionAndVelocity.velocity;

   // Set the Observer at 122.03 West by 36.96 North, in RADIANS
   var observerGd = {
       longitude: satellite.degreesToRadians(144.9633),       
       latitude: satellite.degreesToRadians(-37.8141),
       height: 0.054
   };

   // You will need GMST for some of the coordinate transforms.
   // http://en.wikipedia.org/wiki/Sidereal_time#Definition
  
   var gmst = satellite.gstime(new Date());

   // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
   var positionEcf   = satellite.eciToEcf(positionEci, gmst),
       observerEcf   = satellite.geodeticToEcf(observerGd),
       positionGd    = satellite.eciToGeodetic(positionEci, gmst),
       lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf),
       velocityEcf   = satellite.eciToEcf(velocityEci, gmst),
       dopplerFactor = satellite.dopplerFactor(observerEcf, positionEcf, velocityEcf);

   // The coordinates are all stored in key-value pairs.
   // ECI and ECF are accessed by `x`, `y`, `z` properties.
   var satelliteX = positionEci.x,
       satelliteY = positionEci.y,
       satelliteZ = positionEci.z;

   // Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
      var azimuth   = lookAngles.azimuth;
       elevation = lookAngles.elevation;
       rangeSat  = lookAngles.rangeSat;
       azimuth1 = azimuth;
       elevation1=elevation;

   // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
   var longitude = positionGd.longitude,
       latitude  = positionGd.latitude,
       height    = positionGd.height;

   //  Convert the RADIANS to DEGREES for pretty printing (appends "N", "S", "E", "W", etc).
   var longitudeStr = satellite.degreesLong(longitude),
       latitudeStr  = satellite.degreesLat(latitude);

    longLat = {long:longitudeStr,lat:latitudeStr,alt:height,azimuth:azimuth,elevation:elevation,rangeSat:rangeSat};
    return longLat;
}


function convertTLEtoCoordinatesTimeOffset(tleLine1,tleLine2,minutesToOffset){

  Date.prototype.addMinutes = function(m) {
    this.setTime(this.getTime() + (m*60*1000));
    return this;
  }
  var offsetDate = new Date(); 
  offsetDate.addMinutes(minutesToOffset);

  // Initialize a satellite record
  var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
 
  //  Propagate satellite using time since epoch (in minutes).
  // var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

  //  Or you can use a JavaScript Date
  var positionAndVelocity = satellite.propagate(satrec, offsetDate);

  // The position_velocity result is a key-value pair of ECI coordinates.
  // These are the base results from which all other coordinates are derived.
  var positionEci = positionAndVelocity.position,
      velocityEci = positionAndVelocity.velocity;

  // Set the Observer at 122.03 West by 36.96 North, in RADIANS
  var observerGd = {
    longitude: satellite.degreesToRadians(144.9633),       
    latitude: satellite.degreesToRadians(-37.8141),
    height: 0.370
  };

  // You will need GMST for some of the coordinate transforms.
  // http://en.wikipedia.org/wiki/Sidereal_time#Definition
 
  var gmst = satellite.gstime(offsetDate);

  // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
  var positionEcf   = satellite.eciToEcf(positionEci, gmst),
      observerEcf   = satellite.geodeticToEcf(observerGd),
      positionGd    = satellite.eciToGeodetic(positionEci, gmst),
      lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf),
      velocityEcf   = satellite.eciToEcf(velocityEci, gmst),
      dopplerFactor = satellite.dopplerFactor(observerEcf, positionEcf, velocityEcf);

  // The coordinates are all stored in key-value pairs.
  // ECI and ECF are accessed by `x`, `y`, `z` properties.
  var satelliteX = positionEci.x,
      satelliteY = positionEci.y,
      satelliteZ = positionEci.z;

  // Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
  var azimuth   = lookAngles.azimuth,
      elevation = lookAngles.elevation,
      rangeSat  = lookAngles.rangeSat;

  // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
  var longitude = positionGd.longitude,
      latitude  = positionGd.latitude,
      height    = positionGd.height;

  //  Convert the RADIANS to DEGREES for pretty printing (appends "N", "S", "E", "W", etc).
  var longitudeStr = satellite.degreesLong(longitude),
      latitudeStr  = satellite.degreesLat(latitude);

   var longLat = {long:longitudeStr,lat:latitudeStr,alt:height};
   return longLat;
 
}

  /** 
   * 
   * Fetches TLE data from remote server (space-track.org)
   * 
   * 
   */
  var latlongHolder=[];
  function fetchTLEFromServer(noradID, username, password){

    var TLE = '[{"COMMENT":"GENERATED VIA SPACETRACK.ORG API","ORIGINATOR":"18 SPCS","NORAD_CAT_ID":"25544","OBJECT_NAME":"ISS (ZARYA)","OBJECT_TYPE":"PAYLOAD","CLASSIFICATION_TYPE":"U","INTLDES":"98067A","EPOCH":"2019-12-29 16:31:19","EPOCH_MICROSECONDS":"315200","MEAN_MOTION":"15.49520118","ECCENTRICITY":"0.0005206","INCLINATION":"51.6441","RA_OF_ASC_NODE":"112.1375","ARG_OF_PERICENTER":"80.7345","MEAN_ANOMALY":"71.727","EPHEMERIS_TYPE":"0","ELEMENT_SET_NO":"999","REV_AT_EPOCH":"20558","BSTAR":"-1.3621e-05","MEAN_MOTION_DOT":"-1.219e-05","MEAN_MOTION_DDOT":"0","FILE":"2675216","TLE_LINE0":"0 ISS (ZARYA)","TLE_LINE1":"1 25544U 98067A   19363.68841800 -.00001219  00000-0 -13621-4 0  9999","TLE_LINE2":"2 25544  51.6441 112.1375 0005206  80.7345  71.7270 15.49520118205583","OBJECT_ID":"1998-067A","OBJECT_NUMBER":"25544","SEMIMAJOR_AXIS":"6796.265","PERIOD":"92.931","APOGEE":"421.669","PERIGEE":"414.592","DECAYED":"0"}]';

    TLEdata = JSON.parse(TLE)[0];
      
    if(TLEdata != undefined){
      tleSatName = TLEdata["OBJECT_NAME"];
      tleEpoch = TLEdata["EPOCH"]; 
      tleLine0 = TLEdata["TLE_LINE0"];
      tleLine1 = TLEdata["TLE_LINE1"];
      tleLine2 = TLEdata["TLE_LINE2"];
    }
    else {
      return;
    }

    var latHolder = [];
    var latHolderPrevious = [];
    
    var longHolder = [];
    var longHolderPrevious = [];
    
    var altHolder = [];
    var altHolderPrevious = [];
  
  
    for(var i = 0; i <= 90; i++){
      var returned = convertTLEtoCoordinatesTimeOffset(tleLine1,tleLine2,i); //Convert TLE to long,lat
      latHolder.push( parseFloat(returned["lat"]));  //Get +90 minutes of latitude
      longHolder.push(parseFloat(returned["long"])); //Get +90 minutes of longitude
      altHolder.push(parseFloat(returned["alt"])); //Get +90 minutes of altitude

      var returned = convertTLEtoCoordinatesTimeOffset(tleLine1,tleLine2,-i);  //Convert TLE to long,lat
      latHolderPrevious.push( parseFloat(returned["lat"])); //Get -90 minutes of latitude
      longHolderPrevious.push(parseFloat(returned["long"])); //Get -90 minutes of longitude
      altHolderPrevious.push(parseFloat(returned["alt"])); //Get -90 minutes of altitude
    }

    var currentSatelliteData = convertTLEtoCoordinates(tleLine1,tleLine2);
    latlongHolder = [latHolder,longHolder,latHolderPrevious,longHolderPrevious];

    window.localStorage.clear();

    var satelliteData = {
      "satName":tleSatName,
      "epoch":tleEpoch,
      "tleLine0":tleLine0,
      "tleLine1":tleLine1,
      "tleLine2":tleLine2,

      "lat":currentSatelliteData["lat"],
      "long":currentSatelliteData["long"],
      "altitude":currentSatelliteData["alt"],

      "gsAziumth": (currentSatelliteData["azimuth"] *180) / Math.PI  ,
      "gsElevation": (currentSatelliteData["elevation"] *180) / Math.PI ,
      "gsRangeSat":currentSatelliteData["rangeSat"],

      "antAz":0,
      "antEl":0,

      "nextLat90":latHolder,
      "nextLong90":longHolder,
      "nextAlt90":altHolder,
      
      "prevLat90":latHolderPrevious,
      "prevLong90":longHolderPrevious,
      "prevAlt90":altHolderPrevious,
      
      "gsLat":-37.8141,
      "gsLong":144.9633,
      "gsAlt":0.054,

      "trackingAlgorithm":0,
    };


    //For each value in Satellite Data, write this to a key value pair, and write to local storage
    for ( let prop in satelliteData){
      var key = prop; 
      var value = satelliteData[prop];
      window.localStorage.setItem(key, JSON.stringify(value));
    }
}




function updateLocalStorageSatelliteData(){

  //Needs to update local storage for current lat,long,alt 

  var currentSatelliteData = convertTLEtoCoordinates(tleLine1,tleLine2);
  var satelliteData = {
    "lat":currentSatelliteData["lat"],
    "long":currentSatelliteData["long"],
    "altitude":currentSatelliteData["alt"],

    "gsAziumth": (currentSatelliteData["azimuth"] *180) / Math.PI  ,
    "gsElevation": (currentSatelliteData["elevation"] *180) / Math.PI ,
    "gsRangeSat":currentSatelliteData["rangeSat"],
  }
  //Update all values in local storage
  for ( let prop in satelliteData){
    var key = prop; 
    var value = satelliteData[prop];
    window.localStorage.setItem(key, JSON.stringify(value));
  }

}



function updateLocalStorageTimeData(){
  // a new function for updating the map data 
  var latHolder = [];
  var latHolderPrevious = [];
  var altHolder = [];
  var longHolder = [];
  var longHolderPrevious = [];
  var altHolderPrevious = [];

  for(var i = 0; i <= 90; i++){
    var returned = convertTLEtoCoordinatesTimeOffset(tleLine1,tleLine2,i); //Convert TLE to long,lat
    latHolder.push( parseFloat(returned["lat"]));  //Get +90 minutes of latitude
    longHolder.push(parseFloat(returned["long"])); //Get +90 minutes of longitude
    altHolder.push(parseFloat(returned["alt"])); //Get +90 minutes of altitude

    var returned = convertTLEtoCoordinatesTimeOffset(tleLine1,tleLine2,-i);  //Convert TLE to long,lat
    latHolderPrevious.push( parseFloat(returned["lat"])); //Get -90 minutes of latitude
    longHolderPrevious.push(parseFloat(returned["long"])); //Get -90 minutes of longitude
    altHolderPrevious.push(parseFloat(returned["alt"])); //Get -90 minutes of altitude
  }

  var satelliteData = {

    "nextLat90":latHolder,
    "nextLong90":longHolder,
    "nextAlt90":altHolder,
    
    "prevLat90":latHolderPrevious,
    "prevLong90":longHolderPrevious,
    "prevAlt90":altHolderPrevious,
  };

  //Loop through and write updated values to local storage
  for ( let prop in satelliteData){
    var key = prop; 
    var value = satelliteData[prop];
    window.localStorage.setItem(key, JSON.stringify(value)); 
  }


}