from django.test import TestCase, Client
from django.urls import reverse
from .models import Property
import json

class ApiIntegrationTests(TestCase):
    def setUp(self):
        # Use default client (CSRF checks are disabled by default in tests)
        self.client = Client()

    def test_register_login_me_properties_and_predict(self):
        # Ensure CSRF cookie is set
        resp = self.client.get('/api/csrf/')
        self.assertEqual(resp.status_code, 200)
        token = self.client.cookies.get('csrftoken').value
        # Register
        username = 'test_spa_user'
        register_payload = json.dumps({'username': username, 'email': 'test@example.com', 'password': 'testpass'})
        resp = self.client.post('/api/register/', register_payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('success'))
        # Login
        login_payload = json.dumps({'username': username, 'password': 'testpass'})
        resp = self.client.post('/api/login/', login_payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('success'))
        # Me
        resp = self.client.get('/api/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get('username'), username)
        # Create property in DB
        p = Property.objects.create(title='2 BHK Apartment', description='Nice', price=50.0, location='Delhi', is_for_sale=True)
        # Properties list
        resp = self.client.get('/api/properties/')
        self.assertEqual(resp.status_code, 200)
        results = resp.json().get('results', [])
        self.assertTrue(any(r['title'] == p.title for r in results))
        # Predict
        predict_payload = json.dumps({'bhk': 2, 'furnishing': 'Furnished', 'property_type': 'Apartment', 'city': 'Delhi'})
        resp = self.client.post('/api/predict/', predict_payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('predicted_price', resp.json())

    def test_page_endpoints_json(self):
        # CSRF cookie
        resp = self.client.get('/api/csrf/')
        self.assertEqual(resp.status_code, 200)
        token = self.client.cookies.get('csrftoken').value

        # welcome (select_city) POST
        resp = self.client.post('/welcome/', json.dumps({'city': 'Mumbai'}), content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('success'))
        self.assertEqual(resp.json().get('city'), 'Mumbai')

        # select_details POST
        resp = self.client.post('/select_details/', json.dumps({'bhk': 2, 'furnishing': 'Furnished', 'property_type': 'Apartment'}), content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('success'))

        # predict_price POST override
        resp = self.client.post('/predict_price/', json.dumps({'bhk': 2, 'furnishing': 'Furnished', 'property_type': 'Apartment', 'city': 'Mumbai'}), content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('predicted_price', resp.json())

        # predict_price GET using session values
        s = self.client.session
        s['city'] = 'Mumbai'
        s['bhk'] = 2
        s['furnishing'] = 'Furnished'
        s['property_type'] = 'Apartment'
        s.save()
        resp = self.client.get('/predict_price/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('predicted_price', resp.json())

        # sell (create property) POST
        sell_payload = json.dumps({'title': '3 BHK Apartment', 'description': 'Nice', 'price': 60, 'location': 'Mumbai', 'is_for_sale': True})
        resp = self.client.post('/sell/', sell_payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('success'))
        created_id = resp.json().get('id')
        self.assertIsNotNone(created_id)

        # buy page GET should return properties (we'll at least get results key)
        resp = self.client.get('/buy/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('results', resp.json())

        # map view
        resp = self.client.get('/map/?lat=12.34&lng=56.78')
        self.assertEqual(resp.status_code, 200)
        json_data = resp.json()
        self.assertEqual(json_data.get('latitude'), 12.34)
        self.assertEqual(json_data.get('longitude'), 56.78)

