from urllib.parse import urlencode
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

@api_view(['POST'])
def get_token(request):
    code = request.data.get('code')
    print(f"Received code: {code}")
    token_url = "https://api.intra.42.fr/oauth/token"
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': 'u-s4t2ud-278c6f5b974f198ff7770777621b6736535fe09144a049d6a79e2c37877665db',
        'client_secret': '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',
        'code': code,
        'redirect_uri': 'http://localhost:8000'
    }

    # URL encode the data
    encoded_data = urlencode(token_data)

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'PONG-SPA'
    }

    response = requests.post(
        token_url,
        data=encoded_data,  # Use encoded data
        headers=headers
    )
    return Response(response.json())

@api_view(['GET'])
def test(request):
	return Response({'message': 'Hello, world!'})