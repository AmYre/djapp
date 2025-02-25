from urllib.parse import urlencode
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import GameStats
from web3 import Web3
import json
from django.http import JsonResponse

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

@api_view(['GET'])
def verify_tournament(request):
	# Connect to local blockchain
	w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

	# Contract info
	contract_address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

	# Get ABI from your contract JSON
	with open('blockchain/artifacts/contracts/TournamentScore.sol/TournamentScore.json') as f:
		contract_json = json.load(f)
		contract_abi = contract_json['abi']

	# Create contract instance
	contract = w3.eth.contract(address=contract_address, abi=contract_abi)

	try:
		# Get tournament data from blockchain
		tournament = contract.functions.getTournament(tournament_id).call()
		
		return JsonResponse({
			'verified': True,
			'tournament': {
				'winner': tournament[0],
				'winnerScore': tournament[1],
				'secondPlace': tournament[2],
				'secondScore': tournament[3],
				'thirdPlace': tournament[4],
				'thirdScore': tournament[5],
				'timestamp': tournament[6]
			}
		})
	except Exception as e:
		return JsonResponse({
			'verified': False,
			'error': str(e)
		}, status=400)
		