from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import User
import requests

# Create your views here.
def home(request):
	return render(request, 'home.html')

def dashboard(request):
	return render(request, 'dashboard.html')

# def test(request):
# 	return render(request, 'test.html', {'users': User.objects.all()})

@csrf_exempt
def get_token(request):
	code = request.POST.get('code')
	print(f"Received code: {code}")
	if code:
		token_url = "https://api.intra.42.fr/oauth/token"
		token_data = {
			'grant_type': 'authorization_code',
			'client_id': 'u-s4t2ud-278c6f5b974f198ff7770777621b6736535fe09144a049d6a79e2c37877665db',
			'client_secret': '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',
			'code': code,
			'redirect_uri': 'http://localhost:8000/'
		}
		token_response = requests.post(token_url, data=token_data)
		token_json = token_response.json()
		access_token = token_json.get('access_token')

		if access_token:
			user_info_url = "https://api.intra.42.fr/v2/me"
			headers = {
				'Authorization': f'Bearer {access_token}'
			}
			user_info_response = requests.get(user_info_url, headers=headers)
			user_info = user_info_response.json()
		else:
			user_info = {'error': 'No access token received'}
	else:
		user_info = {'error': 'No code provided'}

	return JsonResponse(user_info)