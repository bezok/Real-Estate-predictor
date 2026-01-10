let selectedBHK = "";
let selectedFurnishing = "";
let selectedPropertyType = "";

function selectBHK() {
    const bhkSelect = document.getElementById('bhk');
    selectedBHK = bhkSelect.value;
}

function selectFurnishing(furnishing) {
    selectedFurnishing = furnishing;
}

function selectPropertyType() {
    const propertyTypeSelect = document.getElementById('property-type');
    selectedPropertyType = propertyTypeSelect.value;
}

function goToPredictionPage() {
    document.getElementById('loading-overlay').style.display = 'flex';

    if (!selectedBHK || !selectedFurnishing || !selectedPropertyType) {
        alert("Please fill in all the details");
        document.getElementById('loading-overlay').style.display = 'none';
        return;
    }

    setTimeout(() => {
        window.location.href = 'prediction.html';
    }, 2000);
}
