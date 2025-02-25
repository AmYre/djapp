from urllib.parse import urlencode
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import GameStats

import requests

@api_view(['POST'])
def token(request):
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

@api_view(['POST'])
def dash(request):
    try:
        stats = request.data.get('stats')
        print(f"*********************Received stats: {stats}")
        if not stats:
            return Response(
                {'error': 'No stats data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate required fields
        required_fields = ['user', 'score', 'user2', 'score2', 'user3', 'score3', 'mode', 'options']
        missing_fields = [field for field in required_fields if field not in stats]

        if missing_fields:
            return Response(
                {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the GameStats object
        game_stats = GameStats.objects.create(
            user=stats['user'],
            score=stats['score'],
            user2=stats['user2'],
            score2=stats['score2'],
            user3=stats['user3'],
            score3=stats['score3'],
            mode=stats['mode'],
            options=stats['options']
        )

        # Return the created object data
        return Response({
            'message': 'Game stats saved successfully',
            'id': game_stats.id,
            'created_at': game_stats.created_at
        }, status=status.HTTP_201_CREATED)

    except ValidationError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': 'An error occurred while saving game stats'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )