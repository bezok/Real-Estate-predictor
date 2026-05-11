# price_prediction/views.py
from django.shortcuts import render, redirect
from .utils import model, model_columns
import pandas as pd
from num2words import num2words
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
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
    # Endpoint returns basic info for SPA clients
    return JsonResponse({'detail': 'Landing endpoint. Use /api endpoints for functionality.'})


# Page 1: Select City
def select_city(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        city = data.get('city')
        if not city:
            return JsonResponse({'error': 'city is required'}, status=400)
        request.session['city'] = city
        return JsonResponse({'success': True, 'city': city})
    # GET: return current selected city (if any)
    return JsonResponse({'city': request.session.get('city')})


# Page 2: Input Details
def select_details(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        try:
            request.session['bhk'] = int(data.get('bhk', 0))
        except Exception:
            return JsonResponse({'error': 'Invalid bhk value'}, status=400)
        request.session['furnishing'] = data.get('furnishing', '')
        request.session['property_type'] = data.get('property_type', '')
        return JsonResponse({'success': True})
    # GET: return current session details if set
    return JsonResponse({
        'bhk': request.session.get('bhk'),
        'furnishing': request.session.get('furnishing'),
        'property_type': request.session.get('property_type'),
    })

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

    # Accept JSON POST with fields to override session values
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            city = data.get('city', city)
            if data.get('bhk') is not None:
                try:
                    bhk = int(data.get('bhk'))
                except Exception:
                    return JsonResponse({'error': 'Invalid bhk value'}, status=400)
            furnishing = data.get('furnishing', furnishing)
            property_type = data.get('property_type', property_type)
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
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
        
        # Model training with Random forest Regressor
        
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
        return JsonResponse({'error': 'An error occurred during prediction. Please try again.', 'details': str(e)}, status=400)

    # Convert price to lac or crore format
    if predict_1 >= 100:
        formatted_price = f"{abs(predict_1) / 100:.2f} Cr"
    else:
        formatted_price = f"{abs(predict_1):.2f} Lac"

    return JsonResponse({'predicted_price': formatted_price, 'value': float(predict_1)})


def auth_landing(request):
    return JsonResponse({'detail': 'Auth endpoint. Use /login/ and /register/ to authenticate.'})

@ensure_csrf_cookie
def login_view(request):
    if request.method == 'GET':
        # Provide instruction to clients; CSRF cookie is set by decorator
        return JsonResponse({'detail': 'POST username and password as JSON to authenticate.'})
    
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # ensure CSRF cookie is present on the successful login response
        resp = JsonResponse({'success': True})
        token = get_token(request)
        resp.set_cookie(settings.CSRF_COOKIE_NAME, token)
        return resp
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=400) 

@ensure_csrf_cookie
def register_view(request):
    if request.method == 'GET':
        # Provide instruction to clients; CSRF cookie is set by decorator
        return JsonResponse({'detail': 'POST username, email and password as JSON to register.'})
    
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
    resp = JsonResponse({'success': True})
    # remove CSRF and session cookies so client state is fully cleared
    resp.delete_cookie(settings.CSRF_COOKIE_NAME)
    resp.delete_cookie(settings.SESSION_COOKIE_NAME)
    return resp


def buy_page(request):
    properties = Property.objects.filter(is_for_sale=True)
    data = []
    for p in properties:
        data.append({
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': float(p.price),
            'location': p.location,
            'is_for_sale': p.is_for_sale,
            'created_at': p.created_at.isoformat(),
            'image_url': request.build_absolute_uri(p.image.url) if p.image else None,
            'lat': float(p.latitude) if p.latitude is not None else None,
            'lng': float(p.longitude) if p.longitude is not None else None,
        })
    return JsonResponse({'results': data})

@ensure_csrf_cookie
def sell_page(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        title = data.get('title', '')
        description = data.get('description', '')
        price = data.get('price', 0)
        location = data.get('location', '')
        is_for_sale = data.get('is_for_sale', True)

        # attempt to parse bhk and property_type from title
        try:
            parts = title.split()
            bhk = int(parts[0])
            property_type = parts[2]
        except Exception:
            bhk = 0
            property_type = ''

        furnishing = description
        try:
            price_lac = float(price)
        except Exception:
            return JsonResponse({'error': 'Invalid price'}, status=400)

        # File path for CSV
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

        # Append the new entry and save
        df = pd.concat([df, pd.DataFrame([new_entry_main])], ignore_index=True)
        df.to_csv(file_path_main, index=False)

        # Update cities.js
        file_path = os.path.join(settings.BASE_DIR, "static", "cities.js")
        try:
            with open(file_path, "r") as file:
                content = file.read()
            match = re.search(r'const cities = (\[.*?\]);', content, re.DOTALL)
            if match:
                cities_list_str = match.group(1)
                cities_list = json.loads(cities_list_str.replace("'", '"'))
                if location not in cities_list:
                    cities_list.append(location)
                updated_content = re.sub(
                    r'const cities = \[.*?\];',
                    f"const cities = {json.dumps(cities_list, indent=4)};",
                    content,
                    flags=re.DOTALL
                )
                with open(file_path, "w") as file:
                    file.write(updated_content)
        except Exception:
            pass

        # Save the property to the database
        prop = Property.objects.create(
            title=title,
            description=description,
            price=price,
            location=location,
            is_for_sale=is_for_sale
        )
        return JsonResponse({'success': True, 'id': prop.id})

    # GET: return a description of required fields
    return JsonResponse({'fields': ['title', 'description', 'price', 'location', 'is_for_sale']})

# API: Get current authenticated user
@require_http_methods(["GET"])
def me(request):
    if request.user.is_authenticated:
        return JsonResponse({'username': request.user.username})
    return JsonResponse({'username': None})

# API: Predict price (POST expects JSON with bhk, furnishing, property_type, city)
@require_http_methods(["POST"])
@ensure_csrf_cookie
def predict_api(request):
    try:
        data = json.loads(request.body)
        bhk = int(data.get('bhk', 0))
        furnishing = data.get('furnishing', '')
        property_type = data.get('property_type', '')
        city = data.get('city', '')

        # Load dataset
        file_path = os.path.join(settings.BASE_DIR, 'static', 'preprocessed_real_estate_data.csv')
        df = pd.read_csv(file_path)

        # One-hot encode categorical features
        df = pd.get_dummies(df, columns=['City', 'Furnishing', 'Property_Type'], drop_first=True)

        # Prepare target and features
        X = df.drop(columns=['Price_Lac'])
        y = df['Price_Lac']

        # Train two models and pick best
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model_rf = RandomForestRegressor(n_estimators=100, random_state=42)
        model_rf.fit(X_train, y_train)
        y_pred_rf = model_rf.predict(X_test)
        r2_rf = r2_score(y_test, y_pred_rf)

        model_lr = LinearRegression()
        model_lr.fit(X_train, y_train)
        y_pred_lr = model_lr.predict(X_test)
        r2_lr = r2_score(y_test, y_pred_lr)

        # Prepare function to create input DataFrame
        def preprocess_input(bhk, furnishing, property_type, city, feature_columns):
            input_data = {col: 0 for col in feature_columns}
            input_data['BHK'] = bhk
            if f'Furnishing_{furnishing}' in feature_columns:
                input_data[f'Furnishing_{furnishing}'] = 1
            if f'Property_Type_{property_type}' in feature_columns:
                input_data[f'Property_Type_{property_type}'] = 1
            if f'City_{city}' in feature_columns:
                input_data[f'City_{city}'] = 1
            return pd.DataFrame([input_data])

        feature_columns = X.columns
        new_data = preprocess_input(bhk, furnishing, property_type, city, feature_columns)

        if r2_rf >= r2_lr:
            pred = model_rf.predict(new_data)[0]
        else:
            pred = model_lr.predict(new_data)[0]

        if pred >= 100:
            formatted_price = f"{abs(pred) / 100:.2f} Cr"
        else:
            formatted_price = f"{abs(pred):.2f} Lac"

        return JsonResponse({'predicted_price': formatted_price})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

#maps

from django.shortcuts import render
def map_view(request):
    context = {
        'latitude': float(request.GET.get('lat', 10.8505)),  # Default Kerala latitude
        'longitude': float(request.GET.get('lng', 76.2711))  # Default Kerala longitude
    }
    return JsonResponse(context)

# API: CSRF cookie endpoint for SPA
@ensure_csrf_cookie
def csrf(request):
    # A simple GET to set the CSRF cookie on the client
    return JsonResponse({"detail": "CSRF cookie set"})

# API: List properties (GET) and create property (POST)
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def property_list(request):
    properties = Property.objects.filter(is_for_sale=True)
    data = []
    for p in properties:
        data.append({
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': float(p.price),
            'location': p.location,
            'is_for_sale': p.is_for_sale,
            'created_at': p.created_at.isoformat(),
            'image_url': request.build_absolute_uri(p.image.url) if p.image else None,
            'lat': float(p.latitude) if p.latitude is not None else None,
            'lng': float(p.longitude) if p.longitude is not None else None,
        })
    return JsonResponse({'results': data})

@require_http_methods(["GET"])
def property_search(request):
    from django.db.models import Q
    q = request.GET.get('q', '')
    properties = Property.objects.filter(
        Q(title__icontains=q) | Q(location__icontains=q) | Q(description__icontains=q),
        is_for_sale=True,
    )
    data = []
    for p in properties:
        data.append({
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': float(p.price),
            'location': p.location,
            'is_for_sale': p.is_for_sale,
            'created_at': p.created_at.isoformat(),
            'image_url': request.build_absolute_uri(p.image.url) if p.image else None,
            'lat': float(p.latitude) if p.latitude is not None else None,
            'lng': float(p.longitude) if p.longitude is not None else None,
        })
    return JsonResponse({'results': data})


@require_http_methods(["GET"])
def property_detail(request, id):
    try:
        p = Property.objects.get(id=id)
        data = {
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': float(p.price),
            'location': p.location,
            'is_for_sale': p.is_for_sale,
            'created_at': p.created_at.isoformat(),
            'image_url': request.build_absolute_uri(p.image.url) if p.image else None,
            'lat': float(p.latitude) if p.latitude is not None else None,
            'lng': float(p.longitude) if p.longitude is not None else None,
        }
        return JsonResponse(data)
    except Property.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

@require_http_methods(["POST"])
@ensure_csrf_cookie
def create_property(request):
    try:
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        price = request.POST.get('price', 0)
        location = request.POST.get('location', '')
        is_for_sale = request.POST.get('is_for_sale', 'true').lower() != 'false'

        # Optional fields sent from frontend
        furnishing = request.POST.get('furnishing', '')
        bhk = request.POST.get('bhk', '')
        property_type = request.POST.get('property_type', '')

        raw_lat = request.POST.get('latitude') or None
        raw_lng = request.POST.get('longitude') or None
        try:
            latitude = float(raw_lat) if raw_lat is not None else None
        except (ValueError, TypeError):
            latitude = None
        try:
            longitude = float(raw_lng) if raw_lng is not None else None
        except (ValueError, TypeError):
            longitude = None

        prop = Property.objects.create(
            title=title,
            description=description,
            price=price,
            location=location,
            is_for_sale=is_for_sale,
            latitude=latitude,
            longitude=longitude,
        )

        image = request.FILES.get('image')
        if image:
            prop.image = image
            prop.save()

        # Try to append to CSV dataset in the required format
        appended_row = None
        try:
            csv_path = os.path.join(settings.BASE_DIR, 'static', 'preprocessed_real_estate_data.csv')
            # Prepare values, sanitize commas in location
            loc_safe = str(location).replace(',', '')
            furn = furnishing if furnishing else ''
            bhk_val = str(int(bhk)) if bhk != '' else ''
            ptype = property_type if property_type else ''
            price_lac = ''
            try:
                price_lac = str(float(price))
            except Exception:
                price_lac = str(price)

            row = [loc_safe, furn, bhk_val, ptype, price_lac]

            import csv
            with open(csv_path, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(row)

            appended_row = ','.join(row)
            print(f"Appended to dataset: {appended_row}")
        except Exception as exc:
            # Do not fail the request if CSV append fails
            print('Failed to append to CSV:', exc)

        # Also attempt to update cities.js (so new city shows up in selectors)
        try:
            file_path = os.path.join(settings.BASE_DIR, "static", "cities.js")
            with open(file_path, "r") as file:
                content = file.read()
            match = re.search(r'const cities = (\[.*?\]);', content, re.DOTALL)
            if match:
                cities_list_str = match.group(1)
                cities_list = json.loads(cities_list_str.replace("'", '"'))
                if location and location not in cities_list:
                    cities_list.append(location)
                updated_content = re.sub(
                    r'const cities = \[.*?\];',
                    f"const cities = {json.dumps(cities_list, indent=4)};",
                    content,
                    flags=re.DOTALL
                )
                with open(file_path, "w") as file:
                    file.write(updated_content)
        except Exception:
            pass

        resp = {'success': True, 'id': prop.id, 'appended_row': appended_row}
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def cities_list(request):
    cities_set = set()
    # from CSV
    try:
        file_path = os.path.join(settings.BASE_DIR, 'static', 'preprocessed_real_estate_data.csv')
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            if 'City' in df.columns:
                cities_set.update(df['City'].dropna().astype(str).str.strip().tolist())
    except Exception:
        pass

    # from DB (Property.location)
    try:
        db_cities = Property.objects.values_list('location', flat=True).distinct()
        cities_set.update([c for c in db_cities if c])
    except Exception:
        pass

    cities = sorted(cities_set)
    return JsonResponse({'count': len(cities), 'cities': cities})

