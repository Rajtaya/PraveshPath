from django.urls import path
from .views import match_results, quick_match

urlpatterns = [
    path('results/<str:session_id>/', match_results, name='match-results'),
    path('quick/', quick_match, name='quick-match'),
]
