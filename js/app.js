// Intialize SideNav
var elem = document.querySelector('.sidenav');
var instance = M.Sidenav.init(elem, 'left');

var initialList = [
  {
      place: "Unkle Jacks",
      lat: 30.7208912,
      lng: 76.7589626,
      category: "Food"
  },
  {
      place: "Audi Chandigarh",
      lat: 30.7004707,
      lng: 76.7892961,
      category: "Showrooms"
  },
  {
      place: "Kaventers",
      lat: 30.7049049,
      lng: 76.8014263,
      category: "Food"
  },
  {
      place: "Rose Garden",
      lat: 30.7475026,
      lng: 76.7842408,
      category: "Garden"
  },
  {
      place: "Terraced Garden",
      lat: 30.7147662,
      lng: 76.7724441,
      category: "Garden"
  },
  {
      place: "Jaguar Dada Motors",
      lat: 30.7454237,
      lng: 76.7850704,
      category: "Showrooms"
  }
];

// Create Map
var map;
var markers = []
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.741482, lng: 76.768066},
        zoom: 13
    });

    for (i = 0; i < initialList.length; i++) {
        var place = initialList[i].place;
        var position = {lat: initialList[i].lat, lng: initialList[i].lng};

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: place,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
    }

}

var PlaceViewModal = function () {

    this.currentPlace = ko.observable(new PlaceModal(initialList[0]));
    this.placesList = ko.observableArray([]);

    this.markersList = ko.observable([]);

    markers.forEach(function (marker) {
        this.markersList.push(marker)
    }, this)

    initialList.forEach(function (place) {
        this.placesList.push(new PlaceModal(place));
    }, this);

    this.filterPlaces = function () {

    };

    this.changeCurrentPlace = function (place) {
        console.log(place);
    };

    // this.changeCurrentPlace = function (viewModal) {
    //     return function () {
    //         markers.forEach(function (marker) {
    //             console.log(this);
    //             if (marker.title != this.place)
    //               marker.setMap(null)
    //         }, viewModal)
    //     };
    // }(this);

};

var PlaceModal = function (data) {

    this.placeText = ko.observable(data.place);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.category = ko.observable(data.category);

};

ko.applyBindings(new PlaceViewModal());
