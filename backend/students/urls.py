from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import register_view, login_view, me_view, google_login_view
from .views import create_profile, my_profile

urlpatterns = [
    path('auth/register/', register_view, name='auth-register'),
    path('auth/login/', login_view, name='auth-login'),
    path('auth/me/', me_view, name='auth-me'),
    path('auth/google/', google_login_view, name='auth-google'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', create_profile, name='create-profile'),
    path('profile/me/', my_profile, name='my-profile'),
]
