let selectedCity = "";

// Function to display filtered cities based on the search input
function filterCities() {
    const search = document.getElementById('city-search').value.toLowerCase();
    const cityList = document.getElementById('city-list');

    if (search === "") {
        cityList.innerHTML = ""; // Clear the list if the search input is empty
        return;
    }

    // Filter cities based on the search text and display the results
    const filteredCities = cities.filter(city => city.toLowerCase().includes(search));
    cityList.innerHTML = filteredCities.map(city =>
        `<div class="city-item" onclick="selectCity('${city}')">${city}</div>`
    ).join('');
}

// Function to set the selected city and update the input value
//function selectCity(city) {
//    selectedCity = city;
//    document.getElementById('city-search').value = city;
//    document.getElementById('city-list').innerHTML = ""; // Clear the list after selection
//}

function selectCity(city) {
    selectedCity = city;
    document.getElementById('city-search').value = city;
    document.getElementById('city-list').innerHTML = ""; // Clear the list after selection

    // Set the hidden field value to the selected city and submit the form
    document.getElementById('selected-city').value = selectedCity;
    document.querySelector('form').submit();
}


// Function to validate selection and proceed to the next page
function goToDetailsPage() {
    if (!selectedCity) {
        alert("Please select a city");
        return;
    }
    localStorage.setItem('selectedCity', selectedCity);
    window.location.href = 'details.html';
}
