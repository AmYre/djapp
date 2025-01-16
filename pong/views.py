from django.shortcuts import render, HttpResponse
from .models import User

# Create your views here.
def home(request):
	return render(request, 'home.html')

def test(request):
	return render(request, 'test.html', {'users': User.objects.all()})