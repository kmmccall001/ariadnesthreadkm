/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function readableTimestamp(ms) {
    return (new Date(Number(ms))).toString();
}

// function savewwaypnts (){
//     console.log()
// }


// function retrievewaypnts (){

// }

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    let positionError = function(error) {
        console.log('Error');
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    let options = { maximumAge: 1000, timeout: 30000, enableHighAccuracy: true };

    let saveLocation = function(elt, ev) {
        console.log('Called saveLocation');
        //alert('Called saveLocation');

        let positionSuccess = function(position) {
            //alert('Position');
            //console.log('Position: ' + position.coords.toString());
            // alert('Latitude: '          + position.coords.latitude          + '\n' +
            //       'Longitude: '         + position.coords.longitude         + '\n' +
            //       'Altitude: '          + position.coords.altitude          + '\n' +
            //       'Accuracy: '          + position.coords.accuracy          + '\n' +
            //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            //       'Heading: '           + position.coords.heading           + '\n' +
            //       'Speed: '             + position.coords.speed             + '\n' +
            //       'Timestamp: '         + position.timestamp                + '\n');

            // If an array already exists in localStorage, pull it out and reconstitute it
            //let oldPos = window.localStorage.getItem('position');
            //console.log('oldPos: "' + oldPos + '"')
            let posArray = JSON.parse(window.localStorage.getItem('position'));
            console.log(posArray);
            if (!Array.isArray(posArray)) { // There wasn't one, so make it
                posArray = new Array();
                console.log('Made: ');
            }
            // Add the current position
            posArray.push([Number(position.coords.latitude), Number(position.coords.longitude)]);
            console.log(JSON.stringify(posArray));

            window.localStorage.setItem('position', JSON.stringify(posArray));


            window.localStorage.setItem('latitude', position.coords.latitude);
            window.localStorage.setItem('longitude', position.coords.longitude);
            window.localStorage.setItem('accuracy', position.coords.accuracy);
            window.localStorage.setItem('timestamp', position.timestamp);
            alert('Position saved:\n\tLatitude: ' + window.localStorage.getItem('latitude') + 
                  '\n\tLongitude: ' + window.localStorage.getItem('longitude') +
                  '\n\tAccuracy: ' + window.localStorage.getItem('accuracy') +
                  '\n\tTimestamp: ' + readableTimestamp(window.localStorage.getItem('timestamp')));
        };

        navigator.geolocation.getCurrentPosition(positionSuccess, positionError, options);
    };
    document.getElementById('save').addEventListener('click', saveLocation, false);

    let findLocation = function(elt, ev) {
        console.log('Called findLocation');

        let findPositionSuccess = function(position) {
            let hereLat = position.coords.latitude;
            let hereLong = position.coords.longitude;
            let here = new google.maps.LatLng(Number(hereLat), Number(hereLong));

            let posArray = JSON.parse(window.localStorage.getItem('position'));
            console.log(posArray);

            let waypts = [];
            for (let pos of posArray) {
                console.log(pos);
                let loc = new google.maps.LatLng(Number(pos[0]), Number(pos[1]));
                let waypt = { location: loc, stopover: true };
                console.log(waypt);
                waypts.unshift(waypt);
                console.log(waypts);
            }

            let there = waypts.pop().location;

            alert('Here (map point A):\n\tLatitude: ' + here.lat() + '\n\tLongitude: ' + here.lng() +
                  '\nThere (map point B):\n\tLatitude: ' + there.lat() + '\n\tLongitude: ' + there.lng());

            // Now, figure out how to get from here to there.
            //let there = new google.maps.LatLng(Number(thereLat), Number(thereLong));
            // First, display a map centered on here.
            let mapOptions = {
                center: here,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            let drawnMap = new google.maps.Map(document.getElementById("map"), mapOptions);

        //     for (let i = 0; i < checkboxArray.length; i++) {
        //       if (checkboxArray.options[i].selected) {
        //         waypts.push({
        //           location: checkboxArray[i].value,
        //           stopover: false,
        //         });
        //       }
        // }

            // Put directions on the map
            let dirserv = new google.maps.DirectionsService();
            //const waypts = [];
            const checkboxArray = document.getElementById("save");

            dirserv.route({origin: there, destination: here, waypoints:waypts, travelMode: google.maps.TravelMode.WALKING}, 
                function(route, status) {
                    if (status !== google.maps.DirectionsStatus.OK) {
                        alert('Directions failed.  Status code: ' + status);
                    }
                    else { // status is OK, so route is valid
                        let renderer = new google.maps.DirectionsRenderer({directions: route,
                                                                           map: drawnMap});
                    }
                });
        }

        navigator.geolocation.getCurrentPosition(findPositionSuccess, positionError, options);
    };
    document.getElementById('find').addEventListener('click', findLocation, false);

    let clearPts = function() {
        window.localStorage.removeItem('position');
    }
    document.getElementById('clear').addEventListener('click', clearPts);

    console.log("device-ready handler complete");

}
