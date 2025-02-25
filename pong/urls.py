"""
URL configuration for djapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from . import views
from . import api

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
	path('api/token/', api.token, name='token'),
	path('api/dash/', api.dash, name='dash'),
	path('api/verify_tournament/', api.verify_tournament, name='verify_tournament'),
	path("__reload__/", include("django_browser_reload.urls")),
]

# tournament path:
#1. The verify-tournament endpoint will be accessible at `/api/verify-tournament/<tournament_id>/`
#2. It's properly scoped to the pong app
#3. It's included in the main URL configuration through the include in urls.py