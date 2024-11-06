# price_prediction/views.py
from django.shortcuts import render, redirect
from .utils import model, model_columns
import pandas as pd
from num2words import num2words


# Page 1: Select City
def select_city(request):
    if request.method == 'POST':
        city = request.POST['city']
        print("request",request)
        print("city",city)
        request.session['city'] = city  # Store in session
        return redirect('select_details')
    return render(request, 'welcome.html')

# Page 2: Input Details
def select_details(request):
    if request.method == 'POST':
        # Collect form data
        request.session['bhk'] = int(request.POST['bhk'])
        request.session['furnishing'] = request.POST['furnishing']
        request.session['property_type'] = request.POST['property_type']
        return redirect('predict_price')
    return render(request, 'details.html')

# Page 3: Show Predicted Price
def predict_price(request):
    city = request.session.get('city')
    bhk = request.session.get('bhk')
    furnishing = request.session.get('furnishing')
    property_type = request.session.get('property_type')
    
    # Create a single-row DataFrame for prediction
    input_data = pd.DataFrame(columns=model_columns)
    input_data.loc[0] = 0  # Initialize all columns to 0

    # Set known values
    input_data['BHK'] = bhk

    # Encode the categorical fields
    if f'City_{city}' in input_data.columns:
        input_data[f'City_{city}'] = 1
    if f'Furnishing_{furnishing}' in input_data.columns:
        input_data[f'Furnishing_{furnishing}'] = 1
    if f'Property_Type_{property_type}' in input_data.columns:
        input_data[f'Property_Type_{property_type}'] = 1

    # Predict the price
    predicted_price = model.predict(input_data)[0]
    
    # Ensure the predicted price is non-negative
    predicted_price = max(0, predicted_price)


    # Convert price to lac or crore format
    if predicted_price >= 100:
        formatted_price = f"{predicted_price / 100:.2f} Cr"
    else:
        formatted_price = f"{predicted_price:.2f} Lac"
    


    return render(request, 'prediction.html', {'predicted_price': formatted_price})

