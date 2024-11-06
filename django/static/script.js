// let selectedFurnishing = "";

// function selectFurnishing(element) {
//     // Clear previous selection
//     document.querySelectorAll('.furnishing-option').forEach(img => {
//         img.classList.remove('selected');
//     });

//     // Mark the clicked image as selected
//     element.classList.add('selected');
//     selectedFurnishing = element.getAttribute('data-value');
// }

// function predictPrice() {
//     // Gather user inputs
//     const bhk = document.getElementById('bhk').value;
//     const city = document.getElementById('city').value;
//     const propertyType = document.getElementById('property-type').value;

//     // Simple validation
//     if (!bhk || !city || !selectedFurnishing || !propertyType) {
//         document.getElementById('result').innerText = "Please select all fields!";
//         return;
//     }

//     // Mock prediction result
//     const estimatedPrice = Math.floor(Math.random() * 5000000) + 500000; // Mock price range: 500,000 to 5,500,000

//     // Display result
//     document.getElementById('result').innerText = `Estimated Price: ₹${estimatedPrice.toLocaleString()}`;
// }
