# price_prediction/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.select_city, name='select_city'),
    path('select_details/', views.select_details, name='select_details'),
    path('predict_price/', views.predict_price, name='predict_price'),
]
