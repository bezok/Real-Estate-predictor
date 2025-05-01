document.addEventListener('DOMContentLoaded', function() {
    const propertyList = document.getElementById('propertyList');
    const searchInput = document.getElementById('searchInput');
    const template = document.getElementById('property-card-template');

    // Fetch properties from Django backend
    async function fetchProperties() {
        try {
            const response = await fetch('/api/properties/');
            const properties = await response.json();
            displayProperties(properties);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    }

    function displayProperties(properties) {
        propertyList.innerHTML = '';
        properties.forEach(property => {
            const card = template.content.cloneNode(true);
            
            // Update card content
            card.querySelector('.property-image').src = property.image_url;
            card.querySelector('.property-image').alt = property.title;
            card.querySelector('.property-title').textContent = property.title;
            card.querySelector('.property-location').textContent = property.location;
            card.querySelector('.bedrooms').textContent = `${property.bedrooms} Beds`;
            card.querySelector('.bathrooms').textContent = `${property.bathrooms} Baths`;
            card.querySelector('.area').textContent = `${property.sqft} sqft`;
            card.querySelector('.property-price').textContent = 
                `₹${(property.price / 100000).toFixed(2)} Lac`;

            // Add click handler for view details button
            card.querySelector('.view-details').addEventListener('click', () => {
                window.location.href = `/property/${property.id}`;
            });

            propertyList.appendChild(card);
        });
    }

    // Search functionality
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        try {
            const response = await fetch(`/api/properties/search/?q=${searchTerm}`);
            const properties = await response.json();
            displayProperties(properties);
        } catch (error) {
            console.error('Error searching properties:', error);
        }
    });

    // Initial load
    fetchProperties();
});