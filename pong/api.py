from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import GameStats
from urllib.parse import urlencode
from dotenv import load_dotenv
from web3 import Web3
import requests
import json
import os
import re

load_dotenv()

@csrf_protect
@require_POST
@api_view(['POST'])
def token(request):
    code = request.data.get('code')
    print(f"Received code: {code}")
    token_url = "https://api.intra.42.fr/oauth/token"
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': os.environ.get('CLIENT_ID'),
        'client_secret': os.environ.get('CLIENT_SECRET'),
        'code': code,
        'redirect_uri': os.environ.get('REDIRECT_UNSLASH')
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

@csrf_protect
@require_POST
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

@csrf_protect
@require_POST
@api_view(['POST'])
def validate(request):
    try:
        data = request.data
        errors = []
        validated_data = {}

        if data.get('mode') not in ['bot', 'human', 'tourn']:
            errors.append("Mode de jeu invalide")
        else:
            validated_data['mode'] = data.get('mode')

        player_fields = []
        if data.get('mode') == 'human':
            player_fields = ['p2']
        elif data.get('mode') == 'tourn':
            player_fields = ['p2', 'p3']

        for field in player_fields:
            if field in data and data[field]:
                sanitized_name = re.sub(r'[^\w\s-]', '', data[field])[:10]
                if not sanitized_name:
                    errors.append(f"Nom du joueur {field} invalide")
                else:
                    validated_data[field] = sanitized_name
            else:
                errors.append(f"Nom du joueur {field} requis")

        game_params = ['bspeed', 'bsize', 'pheight', 'pspeed']
        for param in game_params:
            if param in data:
                try:
                    value = int(data[param])
                    if value not in [0, 25, 50, 75, 100]:
                        errors.append(f"Valeur invalide pour {param}")
                    else:
                        validated_data[param] = value
                except (ValueError, TypeError):
                    errors.append(f"Valeur invalide pour {param}")
            else:
                validated_data[param] = 50  # Valeur par défaut

        validated_data['spacewars'] = bool(data.get('spacewars'))

        if errors:
            return Response({'valid': False, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'valid': True, 'validated_data': validated_data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'valid': False, 'errors': [str(e)]}, status=status.HTTP_400_BAD_REQUEST)