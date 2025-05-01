# price_prediction/urls.py
from django.urls import path , include
from . import views
from .views import map_view

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('landing/', views.landing_page, name='landing_page'),
    path('welcome/', views.select_city, name='select_city'),
    path('select_details/', views.select_details, name='select_details'),
    path('predict_price/', views.predict_price, name='predict_price'),
    path('auth/', views.auth_landing, name='auth_landing'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('buy/', views.buy_page, name='buy'),
    path('sell/', views.sell_page, name='sell'),
    path('map/', map_view, name='map_view'),
]
    # path('api/properties/', views.property_list, name='property_list'),
    # path('api/properties/search/', views.property_search, name='property_search'),
    # path('api/properties/create/', views.create_property, name='create_property'),

