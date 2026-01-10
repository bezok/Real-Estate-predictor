function initMap() {
    var location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: location,
    });

    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Property Location"
    });
}
