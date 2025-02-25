from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import GameStats
import requests
from web3 import Web3
from django.conf import settings

# Create your views here.
def home(request):
	# print(GameStats.objects.all())
	return render(request, 'home.html')

def calculate_radar_values(user_games):
    radar_data = {
        'Speed': 0,        # Average ball speed
        'Attack': 0,       # Average winning margin
        'Defense': 0,      # Average closeness when losing
        'War': 0,          # SpaceWars usage percentage
        'Accuracy': 0,     # Inverse paddle height average
        'Madness': 0       # Extreme options usage
    }

    # Counters for averages
    total_games = len(user_games)
    if total_games == 0:
        return radar_data

    # Counters for specific stats
    speed_sum = 0
    speed_count = 0

    attack_sum = 0
    attack_count = 0

    defense_sum = 0
    defense_count = 0

    spacewars_count = 0
    spacewars_total = 0

    accuracy_sum = 0
    accuracy_count = 0

    madness_sum = 0
    madness_options_total = 0

    # Define extreme options for madness calculation
    extreme_options = {
        'pheight': ['0', '100'],   # Crazy, Why?
        'pspeed': ['0', '100'],    # Painful, Flash
        'bspeed': ['0', '100'],    # Boring, Lightning
        'bsize': ['0', '100']      # Quantic, Cosmic
    }

    # Collect data from each game
    for game in user_games:
        # SPEED - Calculate average ball speed
        if game.options and 'bspeed' in game.options:
            speed_sum += int(game.options['bspeed'])
            speed_count += 1

        # ATTACK - Calculate attack rating based on winning margin
        if game.mode in ['bot', 'human']:
            if game.score > game.score2:  # Won the game
                # Calculate winning margin percentage (5-0 is 100%, 5-4 is 20%)
                margin = game.score - game.score2
                max_possible_margin = 5  # Assuming max score is 5
                attack_rating = (margin / max_possible_margin) * 100
                attack_sum += attack_rating
                attack_count += 1
        elif game.mode == 'tourn':
            if game.score > 0:  # Scored points in tournament
                # In tournament, having 2 points is 100%, 1 point is 50%
                attack_rating = (game.score / 2) * 100
                attack_sum += attack_rating
                attack_count += 1

        # DEFENSE - Calculate defense rating based on losing margin
        if game.mode in ['bot', 'human'] and game.score < game.score2:
            # Calculate how close the loss was (4-5 is 100%, 0-5 is 0%)
            max_possible_deficit = 5  # Assuming max score is 5
            actual_deficit = game.score2 - game.score
            if actual_deficit > 0:
                # Invert the scale: smaller deficit = better defense
                defense_rating = ((max_possible_deficit - actual_deficit) / max_possible_deficit) * 100
                defense_sum += defense_rating
                defense_count += 1

        # WAR - Calculate SpaceWars usage
        # Count every game
        spacewars_total += 1

        # Check if spacewars exists in options
        if game.options and 'spacewars' in game.options:
            # If it exists, it's enabled
            spacewars_count += 1
            print(f"Found game with spacewars enabled")

        # ACCURACY - Calculate paddle height usage (inverse scale)
        if game.options and 'pheight' in game.options:
            pheight_value = int(game.options['pheight'])
            # Invert the scale: 0 = 100%, 100 = 0%
            accuracy_rating = 100 - pheight_value
            accuracy_sum += accuracy_rating
            accuracy_count += 1

        # MADNESS - Calculate extreme options usage
        if game.options:
            options_in_game = 0
            extreme_options_in_game = 0

            for option_key, extreme_values in extreme_options.items():
                if option_key in game.options:
                    options_in_game += 1
                    if game.options[option_key] in extreme_values:
                        extreme_options_in_game += 1

            if options_in_game > 0:
                madness_options_total += options_in_game
                madness_sum += extreme_options_in_game

    # Calculate final averages
    if speed_count > 0:
        radar_data['Speed'] = speed_sum / speed_count

    if attack_count > 0:
        radar_data['Attack'] = attack_sum / attack_count

    if defense_count > 0:
        radar_data['Defense'] = defense_sum / defense_count

    if spacewars_total > 0:
        radar_data['War'] = (spacewars_count / spacewars_total) * 100
        print(f"WAR calculation: {spacewars_count}/{spacewars_total} = {radar_data['War']}%")

    if accuracy_count > 0:
        radar_data['Accuracy'] = accuracy_sum / accuracy_count

    if madness_options_total > 0:
        radar_data['Madness'] = (madness_sum / madness_options_total) * 100

    return radar_data


def dashboard(request):
    # Define option mappings for human-readable labels
    option_labels = {
        'pspeed': {
            '0': 'Painful',
            '25': 'Slow',
            '50': 'Normal',
            '75': 'Quick',
            '100': 'Flash'
        },
        'pheight': {
            '0': 'Crazy',
            '25': 'Small',
            '50': 'Normal',
            '75': 'Big',
            '100': 'Why?'
        },
        'bspeed': {
            '0': 'Boring',
            '25': 'Slow',
            '50': 'Normal',
            '75': 'Quick',
            '100': 'Lightning'
        },
        'bsize': {
            '0': 'Quantic',
            '25': 'Small',
            '50': 'Normal',
            '75': 'Big',
            '100': 'Cosmic'
        },
        'spacewars': {
            'on': 'Enabled',
            'off': 'Disabled'
        }
    }

    # Function to get human-readable option text
    def get_readable_option(key, value):
        if key in option_labels and value in option_labels[key]:
            return f"{key}:{option_labels[key][value]}"
        return f"{key}:{value}"
    user = request.GET.get('user')
    game_stats = GameStats.objects.all()

    # Handle filtering games for the current user
    if user:
        user_games = game_stats.filter(user=user)
    else:
        # If no user specified, include all games
        user_games = game_stats

    # For debugging
    print(f"Found {user_games.count()} games for user: {user}")

    botCount = game_stats.filter(mode='bot').count()
    humanCount = game_stats.filter(mode='human').count()
    tournCount = game_stats.filter(mode='tourn').count()

    # Initialize counters for wins, losses, draws
    wins = 0
    losses = 0
    draws = 0
    total_games = 0

    # Track options statistics
    option_stats = {}
    # Track opponent statistics
    opponent_stats = {}

    # Count wins, losses, and draws for the user
    for game in user_games:
        total_games += 1

        # Track game result
        game_result = None

        # For debugging
        print(f"Processing game: {game.user} vs {game.user2} (mode: {game.mode})")

        if game.mode == 'bot' or game.mode == 'human':
            # In bot/human modes, compare user score with user2 score
            if game.score > game.score2:
                wins += 1
                game_result = 'win'
            elif game.score < game.score2:
                losses += 1
                game_result = 'loss'
            else:
                draws += 1
                game_result = 'draw'

            # Track opponent statistics
            if game.mode == 'bot':
                # Use "Bot" as the opponent name for bot games
                opponent = "Bot"
                if opponent not in opponent_stats:
                    opponent_stats[opponent] = {'played': 0, 'beaten': 0}
                opponent_stats[opponent]['played'] += 1
                if game_result == 'win':
                    opponent_stats[opponent]['beaten'] += 1
                print(f"Bot game recorded: {game_result}, opponent stats now: {opponent_stats['Bot']}")
            elif game.user2 != 'none':
                # For human games, use the actual opponent's username
                if game.user2 not in opponent_stats:
                    opponent_stats[game.user2] = {'played': 0, 'beaten': 0}
                opponent_stats[game.user2]['played'] += 1
                if game_result == 'win':
                    opponent_stats[game.user2]['beaten'] += 1
                print(f"Human game recorded against {game.user2}: {game_result}")

        elif game.mode == 'tourn':
            # In tournament mode, compare user score with both user2 and user3
            user_score = game.score
            other_scores = [game.score2, game.score3]
            other_users = [game.user2, game.user3]

            # If user's score is higher than all others, it's a win
            if user_score > max(other_scores):
                wins += 1
                game_result = 'win'
            # If user's score is lower than any other score, it's a loss
            elif user_score < max(other_scores):
                losses += 1
                game_result = 'loss'
            # Otherwise it's a draw (equal highest score)
            else:
                draws += 1
                game_result = 'draw'

            # Track opponent statistics
            for opp in [game.user2, game.user3]:
                if opp != 'none':
                    if opp not in opponent_stats:
                        opponent_stats[opp] = {'played': 0, 'beaten': 0}
                    opponent_stats[opp]['played'] += 1
                    if game_result == 'win':
                        opponent_stats[opp]['beaten'] += 1

        # Track option statistics if options exist
        if game.options:
            for key, value in game.options.items():
                # Create a readable version of the option key
                readable_key = get_readable_option(key, value)

                if readable_key not in option_stats:
                    option_stats[readable_key] = {
                        'played': 0,
                        'wins': 0,
                        'losses': 0,
                        'draws': 0,
                        'success_rate': 0
                    }
                option_stats[readable_key]['played'] += 1
                if game_result == 'win':
                    option_stats[readable_key]['wins'] += 1
                elif game_result == 'loss':
                    option_stats[readable_key]['losses'] += 1
                elif game_result == 'draw':
                    option_stats[readable_key]['draws'] += 1

    # Calculate success rates for options
    for option, stats in option_stats.items():
        if stats['played'] > 0:
            stats['success_rate'] = (stats['wins'] / stats['played']) * 100

    # Find most played option
    most_played_option = None
    most_played_count = 0
    for option, stats in option_stats.items():
        if stats['played'] > most_played_count:
            most_played_count = stats['played']
            most_played_option = option

    # Find most successful option (min 3 games played)
    most_successful_option = None
    highest_success_rate = 0
    for option, stats in option_stats.items():
        if stats['played'] >= 3 and stats['success_rate'] > highest_success_rate:
            highest_success_rate = stats['success_rate']
            most_successful_option = option

    # Find least successful option (min 3 games played)
    least_successful_option = None
    lowest_success_rate = 100
    for option, stats in option_stats.items():
        if stats['played'] >= 3 and stats['success_rate'] < lowest_success_rate:
            lowest_success_rate = stats['success_rate']
            least_successful_option = option

    # Find most played opponent
    most_played_opponent = None
    most_played_opponent_count = 0

    # Debug opponent stats
    print("Opponent stats:")
    for opponent, stats in opponent_stats.items():
        print(f" - {opponent}: played {stats['played']}, beaten {stats['beaten']}")
        if stats['played'] > most_played_opponent_count:
            most_played_opponent_count = stats['played']
            most_played_opponent = opponent

    # Find most beaten opponent
    most_beaten_opponent = None
    most_beaten_count = 0
    for opponent, stats in opponent_stats.items():
        if stats['beaten'] > most_beaten_count:
            most_beaten_count = stats['beaten']
            most_beaten_opponent = opponent

    # Calculate percentages
    if total_games > 0:
        win_percentage = (wins / total_games) * 100
        loss_percentage = (losses / total_games) * 100
        draw_percentage = (draws / total_games) * 100
    else:
        win_percentage = 0
        loss_percentage = 0
        draw_percentage = 0

    # Prepare basic stats dictionary
    if (botCount+humanCount+tournCount) == 0:
        stats = {
            'total': 0,
            'modes': {
                'bot': 0,
                'human': 0,
                'tourn': 0
            }
        }
    else:
        stats = {
            'total': game_stats.count(),
            'modes': {
                'bot': botCount/(botCount+humanCount+tournCount)*100,
                'human': humanCount/(botCount+humanCount+tournCount)*100,
                'tourn': tournCount/(botCount+humanCount+tournCount)*100
            }
        }

    # Add result statistics
    stats['results'] = {
        'wins': win_percentage,
        'losses': loss_percentage,
        'draws': draw_percentage,
        'raw_counts': {
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'total_games': total_games
        }
    }

    # Add option and opponent statistics
    stats['options'] = {
        'most_played': most_played_option if most_played_option else "N/A",
        'most_successful': most_successful_option if most_successful_option else "N/A",
        'least_successful': least_successful_option if least_successful_option else "N/A",
        'details': option_stats
    }

    # Make opponent stats available directly in the main stats dictionary
    # Add debug info
    print(f"Most played opponent: {most_played_opponent}, count: {most_played_opponent_count}")
    print(f"Most beaten opponent: {most_beaten_opponent}, count: {most_beaten_count}")

    stats['most_played_opponent'] = most_played_opponent if most_played_opponent else "N/A"
    stats['most_beaten_opponent'] = most_beaten_opponent if most_beaten_opponent else "N/A"

    # Keep the detailed structure as well
    stats['opponents'] = {
        'most_played': most_played_opponent if most_played_opponent else "N/A",
        'most_beaten': most_beaten_opponent if most_beaten_opponent else "N/A",
        'details': opponent_stats
    }

    # Calculate the most popular options (original code)
    all_options = [game.options for game in game_stats if game.options]
    most_played_options = {}
    if all_options:
        for game_options in all_options:
            for key, value in game_options.items():
                if key not in most_played_options:
                    most_played_options[key] = {}
                if value not in most_played_options[key]:
                    most_played_options[key][value] = 0
                most_played_options[key][value] += 1

    most_popular = {}
    for option_type, values in most_played_options.items():
        most_popular[option_type] = max(values.items(), key=lambda x: x[1])[0]

    # Add most popular options with readable labels
    most_popular_readable = {}
    for option_type, value in most_popular.items():
        most_popular_readable[option_type] = get_readable_option(option_type, value).split(':')[1]

    stats['most_played_options'] = most_popular
    stats['most_played_options_readable'] = most_popular_readable

    # Calculate radar chart values
    radar_values = calculate_radar_values(list(user_games))

    # Add radar chart data to stats
    stats['radar_chart'] = radar_values

    # Add the complete opponent stats for direct access
    stats['opponent_stats'] = opponent_stats

    # Return both the original stats and the raw opponent data for debugging
    context = {
        'stats': stats,
        'opponent_data': opponent_stats
    }
    return render(request, 'dashboard.html', context)

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