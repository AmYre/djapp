from django.shortcuts import render, HttpResponse
from .models import User
import requests

# Create your views here.
def home(request):
	return render(request, 'home.html')

def test(request):
	return render(request, 'test.html', {'users': User.objects.all()})

def user(request):
	code = request.GET.get('code')
	if code:
		token_url = "https://api.intra.42.fr/oauth/token"
		token_data = {
			'grant_type': 'authorization_code',
			'client_id': 'u-s4t2ud-430c86d0bc180f3cc2225e562523e9bb9b060d27de7b9125654633f8585ade65',
			'client_secret': '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',
			'code': code,
			'redirect_uri': 'http://localhost:8000/user'
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

	return render(request, 'user.html', {'user_info': user_info})