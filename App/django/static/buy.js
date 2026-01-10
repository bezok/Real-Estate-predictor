let map;
let marker;

function initMap() {
    var defaultLocation = { lat: 8.5241, lng: 76.9366 }; // Default: Trivandrum

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: defaultLocation
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Location"
    });
}

function searchLocation() {
    var locationName = document.getElementById('location').value;
    if (!locationName) {
        alert("Please enter a location name.");
        return;
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationName }, function(results, status) {
        if (status === 'OK') {
            var newLocation = results[0].geometry.location;
            map.setCenter(newLocation);
            marker.setPosition(newLocation);
        } else {
            alert("Location not found: " + status);
        }
    });
}
