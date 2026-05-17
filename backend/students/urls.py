from django.urls import path
from .views import create_profile, profile_detail

urlpatterns = [
    path('profile/', create_profile, name='create-profile'),
    path('profile/<str:session_id>/', profile_detail, name='profile-detail'),
]
