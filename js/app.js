// Intialize SideNav
var sidenav = document.querySelector('.sidenav');
var sidenavInstance = M.Sidenav.init(sidenav, 'left');
// Initialize Dorp Down
var dropdown = document.querySelector('.dropdown-trigger');
var dropdownInstance = M.Dropdown.init(dropdown, {'closeOnCLick': true});

// Sample list for locations.
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
// Acts as the model of the MVVM.
var markers = [];
// Temp markers array to store the markers
var tempMarkers = [];

// Photos Array
var photos = [];

var openInfoWindow = null;
var defaultIcon;
var highlightedIcon;

// Callback function when ASync call completes.
function initMap() {

    // Create a map object
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.741482, lng: 76.768066},
        zoom: 13
    });
    // Create colors for the markers
    defaultIcon = makeMarkerIcon("0091ff");
    highlightedIcon = makeMarkerIcon("FFFF24");

    // Populate the Markers array
    for (var i = 0; i < initialList.length; i++) {
        var place = initialList[i].place;
        var position = {lat: initialList[i].lat, lng: initialList[i].lng};
        var category = initialList[i].category;
        var id = initialList[i].id;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: place,
            id: id,
            icon: defaultIcon,
            category: category,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
    };
    // Get information about the markers from Forequare API.
    tempMarkers = tempMarkers.concat(markers);
    getMarkersData();
}
function googleError(){
    alert("Failed to load data. Check the url");
};
// Function to fetch the data for all the markers.
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
    // After all the images have been fetched, then setup the info window
    Promise.all(imagefetch)
      .then(()=>{
        for(image of imagefetch){
          image.then(url => photos.push(url))
        }
      })
      .catch( (error) => alert(error))
      .then(()=>{
        setupInfoWindow()
      })
}

// This function creates InfoWindow objects and adds them to the marker.
function setupInfoWindow() {
    var marker, photoUrl;
    for (var i = 0; i < markers.length; i++) {
        markers[i].infoWindow = new google.maps.InfoWindow();
        markers[i].photoUrl = photos[i];
        markers[i].addListener('click', function (marker) {
            return function () {
              toggleBounce(marker);
              populateInfoWindow(marker);
            }

        }(markers[i]));
        markers[i].addListener('mouseover', function (marker) {
            return function () {
              marker.setIcon(highlightedIcon);
            }

        }(markers[i]));
        markers[i].addListener('mouseout', function (marker) {
            return function () {
              marker.setIcon(defaultIcon);
            }
        }(markers[i]));
    }
    // Apply bindings after map as been loaded and the images have been received.
    ko.applyBindings(new PlaceViewModal());
}

// Function that creates the colors for the markers.
function makeMarkerIcon(color) {
    var icon = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
      color + '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return icon;
}

// Function to toggle the bouncing of the markers
function toggleBounce(marker) {
    if (marker.getAnimation() !== null){
        marker.animation = null;
    } else {
        marker.setAnimation(google.maps.Animation.DROP);
    }
}

// Function to add information to the infowindow
function populateInfoWindow(marker) {
    marker.infoWindow.marker = marker;
    marker.infoWindow.setContent(`<div><img src="${marker.photoUrl}"/></div>`);
    marker.infoWindow.open(map, marker);
    if (openInfoWindow !== null) {
        openInfoWindow.close();
        openInfoWindow = null;
    }
    openInfoWindow = marker.infoWindow;
    // Make sure the marker property is cleared if the infowindow is closed.
    marker.infoWindow.addListener('closeclick', function() {
        marker.infoWindow.marker = null;
    });
}

// ViewModal for the Map.
var PlaceViewModal = function () {

    // Observable Array to store markers.
    this.markersList = ko.observableArray(markers);

    // Category List
    this.categoryList = ["All", "Food", "Showrooms", "Garden"];

    // Photos List
    this.photosList = ko.observableArray(photos);

    // Callback that will be called when the contents of the list will be filtered.
    this.filterPlaces = function (viewModal) {
        return function () {
              var currentCategory = this;
              if (currentCategory == "All") {
                viewModal.markersList.removeAll();
                tempMarkers.forEach(function (marker) {
                  viewModal.markersList.push(marker);
                  marker.setMap(map);
                  marker.infoWindow.close();
                  toggleBounce(marker);
                }, this);
              } else {
                tempMarkers.forEach(function (marker) {
                  // Check if the category of the marker matches the selected category.
                  // If not, then remove the marker from the viewModal
                  if (currentCategory != marker.category) {
                    // Find the index of the marker in the viewModal list.
                    var index = viewModal.markersList.indexOf(marker);
                    // Before removing, check if the marker is being displayed in the viewModal
                    if (index != -1) {
                      // The marker category does not match and is present in the viewModal.
                      viewModal.markersList.remove(marker);
                      marker.setMap(null);
                    }
                  } else { // Category matches and the marker is to be displayed in the viewModal.
                    // Check if the marker is already displayed in the ViewModal
                    if (viewModal.markersList.indexOf(marker) == -1) {
                      // The marker is not present in the list ans hence has to be added.
                      viewModal.markersList.push(marker);
                      marker.setMap(map);
                      marker.infoWindow.close();
                    } else {
                      marker.setMap(map);
                      marker.infoWindow.close();
                    }
                    toggleBounce(marker);
                  }
                }, this);
              };
        };
    }(this);

    // Callback which will be called when the place from the list is clicked.
    this.changeCurrentMarker = function (viewModal) {
      return function () {
          var title = this.title;
          ko.utils.arrayForEach(viewModal.markersList(), function (marker) {
              console.log(title, marker.title);
              if (title != marker.title) {
                  marker.setMap(null);
                  marker.infoWindow.close();
              } else {
                marker.setMap(map);
                toggleBounce(marker);
                populateInfoWindow(marker);
              }
          })
      }
    }(this);

};
