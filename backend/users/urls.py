from django.urls import path
from . import views
from .views import csrf

urlpatterns = [
     path('csrf/', csrf),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('current/', views.current_user, name='current_user'),
    path('profile/', views.update_profile, name='update_profile'),
]