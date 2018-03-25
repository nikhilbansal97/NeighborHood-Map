// Intialize SideNav
var sidenav = document.querySelector('.sidenav');
var sidenavInstance = M.Sidenav.init(sidenav, 'left');

var dropdown = document.querySelector('.dropdown-trigger');
var dropdownInstance = M.Dropdown.init(dropdown, {'closeOnCLick': true});

var initialList = [
  {
      id: "5454a780498eb34a3823cac3",
      place: "Dunkin' Donuts",
      lat: 30.7206600,
      lng: 76.7587119,
      category: "Food"
  },
  {
      id: "4e6b084c7d8b143eb760ca44",
      place: "Mercedes Joshi Autozone",
      lat: 30.6999868,
      lng: 76.7892571,
      category: "Showrooms"
  },
  {
      id: "5114cd90e4b06bb0ed15a97f",
      place: "Kaventers",
      lat: 30.7049049,
      lng: 76.8014263,
      category: "Food"
  },
  {
      id: "4c0ba827009a0f47975cebbf",
      place: "Rose Garden",
      lat: 30.7475026,
      lng: 76.7842408,
      category: "Garden"
  },
  {
      id: "4e7b5a72b80384d5f5688b3e",
      place: "Terraced Garden",
      lat: 30.7147662,
      lng: 76.7724441,
      category: "Garden"
  },
  {
      id: "4e709875a8098087a028cd74",
      place: "Porsche Service centre",
      lat: 30.7032741,
      lng: 76.7903332,
      category: "Showrooms"
  }
];

// Map Object
var map;

// Markers array
var markers = []

// Photos Array
var photos = [];

// Callback function when ASync call completes.
function initMap() {
    // Create a map object
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.741482, lng: 76.768066},
        zoom: 13
    });

    // Populate the Markers array
    for (i = 0; i < initialList.length; i++) {
        var place = initialList[i].place;
        var position = {lat: initialList[i].lat, lng: initialList[i].lng};
        var category = initialList[i].category;
        var id = initialList[i].id;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: place,
            id: id,
            category: category,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
    };
    // Get information about the markers from Forequare API.
    getMarkersData();
}

function getMarkersData() {
    var imagefetch = markers.map(function (marker) {
          var url = "https://api.foursquare.com/v2/venues/" + marker.id + "?client_id=JU2UWXY4QIBEX332XAFFRFJN0HNLGGU4VNLUFANT131W4BK2&client_secret=ILFXGAMSE2ZGLWULK13KCJVEMYQKY3XUJR2ZWHTIUP2F1AXV&v=20120609"
          return fetch(url)
            .then(data=> data.json())
            .then(data => {
              var bestPhoto = (data.response.venue && data.response.venue.bestPhoto);
              var photoUrl = bestPhoto.prefix + "200x200" + bestPhoto.suffix;
              return photoUrl
            })
    });
    Promise.all(imagefetch)
      .then(()=>{
        console.log(imagefetch)
        for(image of imagefetch){
          image.then(url => photos.push(url))
        }
      })
      .then(()=>{
        setupInfoWindow()
      })
}

// This function creates InfoWindow objects and adds them to the marker.
function setupInfoWindow() {
    var marker, photoUrl;
    for (i = 0; i < markers.length; i++) {
        markers[i].infoWindow = new google.maps.InfoWindow();
        markers[i].photoUrl = photos[i];
        markers[i].addListener('click', function (marker) {
            return function () {
              populateInfoWindow(marker);
            }

        }(markers[i]));
    }
    // Apply bindings after map as been loaded and the images have been received.
    ko.applyBindings(new PlaceViewModal());
}

function populateInfoWindow(marker) {
    marker.infoWindow.marker = marker;
    marker.infoWindow.setContent(`<div><img src="${marker.photoUrl}"/></div>`);
    marker.infoWindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    marker.infoWindow.addListener('closeclick', function() {
        marker.infoWindow.marker = null;
    });
}

// ViewModal for the Map.
var PlaceViewModal = function () {

    // Observable Array to store markers.
    this.markersList = ko.observableArray(markers);

    // Populate the markers list.
    // markers.forEach(function (marker) {
    //     this.markersList.push(marker);
    // }, this);

    // Category List
    this.categoryList = ["Food", "Showrooms", "Garden"];

    // Plotos List
    this.photosList = ko.observableArray(photos);

    // Function to filter the markers.
    this.filterPlaces = function (viewModal) {
        return function () {
            var currentCategory = this;
            ko.utils.arrayForEach(viewModal.markersList(), function (marker) {
                if (currentCategory != marker.category) {
                    marker.setMap(null);
                } else {
                    marker.setMap(map);
                }
            });
        };
    }(this);

    this.changeCurrentMarker = function (viewModal) {
      return function () {
          var title = this.title;
          ko.utils.arrayForEach(viewModal.markersList(), function (marker) {
              console.log(title, marker.title);
              if (title != marker.title) {
                  marker.setMap(null);
              } else {
                marker.setMap(map);
              }
          })
      }
    }(this);

};
