# price_prediction/views.py
from django.shortcuts import render, redirect
from .utils import model, model_columns
import pandas as pd
from num2words import num2words
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
import json
import os
from django.conf import settings
from .models import Property
from .forms import PropertyForm
from django.core.paginator import Paginator
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import re
from sklearn.ensemble import RandomForestRegressor

def landing_page(request):
    return render(request, 'landing.html')


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

import os
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
#map


# Page 3: Show Predicted Price
def predict_price(request):
    city = request.session.get('city')
    bhk = request.session.get('bhk')
    furnishing = request.session.get('furnishing')
    property_type = request.session.get('property_type')
    
    try:
        print("Starting prediction process...")

        # Load dataset
        file_path = os.path.join(settings.BASE_DIR, 'static', 'preprocessed_real_estate_data.csv')
        df = pd.read_csv(file_path)

        print("Dataset loaded successfully.")

        # One-hot encode categorical features
        df = pd.get_dummies(df, columns=['City', 'Furnishing', 'Property_Type'], drop_first=True)

        # Prepare target and features
        X = df.drop(columns=['Price_Lac'])
        y = df['Price_Lac']

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Model training with Linear Regression
        # model = LinearRegression()
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        r2=r2_score(y_test, y_pred)
        print("r2 score:",{r2})
        print("Model trained successfully.")
        
        #2nd model
        
        # Prepare target and features
        X1 = df.drop(columns=['Price_Lac'])
        y1 = df['Price_Lac']

        # Train-test split
        X_train1, X_test1, y_train1, y_test1 = train_test_split(X1, y1, test_size=0.2, random_state=42)
        
        # Model training with Linear Regression
        # model = LinearRegression()
        model1 = LinearRegression()
        model1.fit(X_train1, y_train1)

        y_pred_l = model1.predict(X_test1)
        r2_l=r2_score(y_test1, y_pred_l)
        print("r2 score:",{r2_l})
        print("Model trained successfully.")


        # Function to preprocess input data
        def preprocess_input(bhk, furnishing, property_type, city, feature_columns):
            # Create a dictionary with all feature columns set to 0
            input_data = {col: 0 for col in feature_columns}
            
            # Assign user values
            input_data['BHK'] = bhk  # Numerical feature
            
            # Set one-hot encoded values only if the column exists
            if f'Furnishing_{furnishing}' in feature_columns:
                input_data[f'Furnishing_{furnishing}'] = 1
            if f'Property_Type_{property_type}' in feature_columns:
                input_data[f'Property_Type_{property_type}'] = 1
            if f'City_{city}' in feature_columns:
                input_data[f'City_{city}'] = 1

            # Convert dictionary to DataFrame
            return pd.DataFrame([input_data])

        # Get feature columns from training data
        feature_columns = X_train.columns

        # Prepare input data
        new_data = preprocess_input(bhk, furnishing, property_type, city, feature_columns)

        print("Preprocessed input data:\n", new_data)

        # Predict price
        if(r2>r2_l):
            predicted_price = model.predict(new_data)[0]
            print(f"Predicted Price (in Lacs): {predicted_price:.2f}")
            predict_1=predicted_price
        else:
            predicted_price1 = model1.predict(new_data)[0]
            print(f"Predicted Price linear (in Lacs): {predicted_price1:.2f}")
            predict_1=predicted_price1

    except Exception as e:
        print("Error during prediction:", str(e))
        return render(request, 'prediction.html', {'error': 'An error occurred during prediction. Please try again.'})

    # Convert price to lac or crore format
    if predict_1 >= 100:
        formatted_price = f"{abs(predict_1) / 100:.2f} Cr"
    else:
        formatted_price = f"{abs(predict_1):.2f} Lac"

    return render(request, 'prediction.html', {'predicted_price': formatted_price})


def auth_landing(request):
    return render(request, 'auth.html')

@ensure_csrf_cookie
def login_view(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=400)

@ensure_csrf_cookie
def register_view(request):
    if request.method == 'GET':
        return render(request, 'register.html')
    
    data = json.loads(request.body)
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email already exists'}, status=400)
    
    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def logout_view(request):
    logout(request)
    return JsonResponse({'success': True})


def buy_page(request):
    properties = Property.objects.filter(is_for_sale=True)  # Fetch properties for sale
    context = {
        'properties': properties
    }
    return render(request, 'buy.html', context)

@ensure_csrf_cookie
def sell_page(request):
    if request.method == 'POST':
        form = PropertyForm(request.POST)
        if form.is_valid():

            data = form.cleaned_data.get('title').split()
            bhk, property_type = data[0], data[2]
            location = form.cleaned_data.get('location')
            furnishing = form.cleaned_data.get('description')
            price_lac = float(form.cleaned_data.get('price'))

            def cities_add(): 


                # File path
                file_path_main = os.path.join(settings.BASE_DIR, 'static', 'preprocessed_real_estate_data.csv')

                # Load existing CSV file into DataFrame (handling the case where file doesn't exist)
                if os.path.exists(file_path_main):
                    df = pd.read_csv(file_path_main)
                else:
                    df = pd.DataFrame(columns=['City', 'Furnishing', 'BHK', 'Property_Type', 'Price_Lac'])

                # New entry
                new_entry_main = {
                    'City': location,
                    'Furnishing': furnishing,
                    'BHK': int(bhk),
                    'Property_Type': property_type,
                    'Price_Lac': price_lac
                }

                # Append the new entry
                df = pd.concat([df, pd.DataFrame([new_entry_main])], ignore_index=True)

                # Save updated DataFrame back to CSV
                df.to_csv(file_path_main, index=False)

                print(df.tail())  # Debugging

            cities_add()

            def modify_cities_js(location):
                # Construct the file path
                file_path = os.path.join(settings.BASE_DIR, "static", "cities.js")

                try:
                    # Read the existing file
                    with open(file_path, "r") as file:
                        content = file.read()

                    # Extract the list using regex with re.DOTALL
                    match = re.search(r'const cities = (\[.*?\]);', content, re.DOTALL)
                    if match:
                        cities_list_str = match.group(1)

                        # Convert to Python list (replace single quotes if any)
                        cities_list = json.loads(cities_list_str.replace("'", '"'))

                        # Append "delhi" if not already present
                        if location not in cities_list:
                            cities_list.append(location)

                        # Replace the old list with the updated one
                        updated_content = re.sub(
                            r'const cities = \[.*?\];', 
                            f"const cities = {json.dumps(cities_list, indent=4)};", 
                            content, 
                            flags=re.DOTALL
                        )

                        # Write back to the file
                        with open(file_path, "w") as file:
                            file.write(updated_content)

                        return JsonResponse({"status": "success", "message": "cities.js updated successfully"})

                    return JsonResponse({"status": "error", "message": "cities list not found in file"})

                except Exception as e:
                    return JsonResponse({"status": "error", "message": str(e)})
            modify_cities_js(location)

            form.save()  # Save the property to the database
            return redirect('buy')  # Redirect to the buy page after listing
    else:
        form = PropertyForm()
    return render(request, 'sell.html', {'form': form})
#maps

from django.shortcuts import render
def map_view(request):
    context = {
        'latitude': request.GET.get('lat', 10.8505),  # Default Kerala latitude
        'longitude': request.GET.get('lng', 76.2711)  # Default Kerala longitude
    }
    return render(request, "buy.html", context)


