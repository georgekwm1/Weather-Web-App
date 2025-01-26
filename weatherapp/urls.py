from django.contrib import admin
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register', views.Register.as_view(), name='register'),
    path('login', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout', views.LogoutView.as_view(), name='logout'),
    path('request_token', views.request_token, name='request_token'),
    path('reset_token/<str:reset_token>',
         views.reset_token, name='request_token'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify', views.VerifyToken.as_view(), name='token_verify'),
    path('get_current_location', views.get_current_location,
         name='get_current_location'),
    path('get_location', views.get_location, name='get_location'),
    path('update_location/<int:query_id>',
         views.update_location, name='update_location'),
    path('delete_location/<int:query_id>',
         views.delete_location, name='delete_location'),
    path('history', views.QueryHistoryView.as_view(), name='history'),

]
