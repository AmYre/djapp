function displayPlayers() {
	const h2 = document.getElementById("versus");
	const state = JSON.parse(localStorage.getItem("pongAppState"));
	const mode = state?.mode;
	if (mode === "bot") h2.innerHTML = `🐵 ${state?.user?.login || "Player1"} VS Bot 🤖`;
	else if (mode === "human") {
		h2.innerHTML = `${state?.user?.login || "Player1"} VS ${state?.user2 || "Player2"}`;
	} else if (mode === "tourn") {
		if (state.game == 0) h2.innerHTML = `${state?.user?.login || "Player1"} VS ${state?.user2 || "Player2"}`;
		else if (state.game == 1) h2.innerHTML = `${state?.user || "Player1"} VS ${state?.user3 || "Player3"}`;
		else if (state.game == 2) h2.innerHTML = `${state?.user2 || "Player2"} VS ${state?.user3 || "Player3"}`;
	}
}

function initGame() {
	const canvas = document.getElementById("gameCanvas");
	const frame = document.getElementById("gameFrame");
	const btns = document.getElementById("gameBtns");
	const score = document.getElementById("gameScore");
	const state = JSON.parse(localStorage.getItem("pongAppState"));
	const h2 = document.getElementById("versus");
	let reversed = false;

	btns.innerHTML = "";

	function sortWinner(state) {
		console.log("STATE in sort", state);
		const players = [
			{ player: state.user.login, score: state.score },
			{ player: state.user2, score: state.score2 },
			{ player: state.user3, score: state.score3 },
		];
		players.sort((a, b) => b.score - a.score);

		console.log("WINNER", players);
		return players;
	}

	if (canvas) {
		const canvas = document.getElementById("gameCanvas");
		const ctx = canvas.getContext("2d");

		// Game settings
		let paddleWidth = 20;
		let paddleHeight = 100;
		let ballSize = 10;
		let paddleSpeed = 5;
		let initialBallSpeed = 7;

		let w = "w";
		let s = "s";
		let up = "ArrowUp";
		let down = "ArrowDown";

		if (state.options.pheight == "0") {
			paddleHeight = 10;
			paddleWidth = 2;
		} else if (state.options.pheight == "25") {
			paddleHeight = 50;
			paddleWidth = 10;
		} else if (state.options.pheight == "50") {
			paddleHeight = 100;
		} else if (state.options.pheight == "75") {
			paddleHeight = 200;
		} else if (state.options.pheight == "100") {
			paddleHeight = 300;
		}

		if (state.options.pspeed == "0") {
			paddleSpeed = 1;
		} else if (state.options.pspeed == "25") {
			paddleSpeed = 3;
		} else if (state.options.pspeed == "50") {
			paddleSpeed = 5;
		} else if (state.options.pspeed == "75") {
			paddleSpeed = 10;
		} else if (state.options.pspeed == "100") {
			paddleSpeed = 20;
		}

		if (state.options.bspeed == "0") {
			initialBallSpeed = 1;
		} else if (state.options.bspeed == "25") {
			initialBallSpeed = 3;
		} else if (state.options.bspeed == "50") {
			initialBallSpeed = 5;
		} else if (state.options.bspeed == "75") {
			initialBallSpeed = 15;
		} else if (state.options.bspeed == "100") {
			initialBallSpeed = 50;
		}

		if (state.options.bsize == "0") {
			ballSize = 1;
		} else if (state.options.bsize == "25") {
			ballSize = 5;
		} else if (state.options.bsize == "50") {
			ballSize = 12;
		} else if (state.options.bsize == "75") {
			ballSize = 30;
		} else if (state.options.bsize == "100") {
			ballSize = 100;
		}

		// Game variables
		let player1Y = (canvas.height - paddleHeight) / 2;
		let player2Y = (canvas.height - paddleHeight) / 2;
		let ballX = canvas.width / 2;
		let ballY = canvas.height / 2;
		let ballSpeedX = initialBallSpeed;
		let ballSpeedY = initialBallSpeed;
		let player1Score = 0;
		let player2Score = 0;
		const WINNING_SCORE = 1;
		let gameOver = false;

		// Key handling
		let keysPressed = {};

		document.addEventListener("keydown", (event) => {
			keysPressed[event.key] = true;
		});

		document.addEventListener("keyup", (event) => {
			delete keysPressed[event.key];
		});

		function updateAI() {
			const paddleCenter = player2Y + paddleHeight / 2;
			const predictedBallY = ballY + (ballSpeedY * (canvas.width - ballX)) / ballSpeedX;
			let aiPaddleSpeed = paddleSpeed;

			if (paddleCenter < predictedBallY) {
				player2Y += aiPaddleSpeed;
			} else if (paddleCenter > predictedBallY) {
				player2Y -= aiPaddleSpeed;
			}

			player2Y = Math.max(0, Math.min(player2Y, canvas.height - paddleHeight));
		}

		// Game loop
		function gameLoop() {
			if (!gameOver) {
				requestAnimationFrame(gameLoop);
				update();
				if (state.mode === "bot") updateAI();
				draw();
			}
		}

		// Update game logic
		function update() {
			if (keysPressed[" "]) {
				if (reversed) {
					reversed = false;
					w = "w";
					s = "s";
					up = "ArrowUp";
					down = "ArrowDown";
				} else {
					w = "s";
					s = "w";
					up = "ArrowDown";
					down = "ArrowUp";
					reversed = true;
				}
			}

			if (keysPressed[w]) player1Y -= paddleSpeed;
			if (keysPressed[s]) player1Y += paddleSpeed;
			if (keysPressed[up]) player2Y -= paddleSpeed;
			if (keysPressed[down]) player2Y += paddleSpeed;

			player1Y = Math.max(0, Math.min(player1Y, canvas.height - paddleHeight));
			player2Y = Math.max(0, Math.min(player2Y, canvas.height - paddleHeight));

			// Move the ball
			ballX += ballSpeedX;
			ballY += ballSpeedY;

			// Ball collision with walls
			if (ballY < ballSize || ballY > canvas.height - ballSize) {
				ballSpeedY = -ballSpeedY;
			}

			// Ball collision with paddles
			if (ballX - ballSize < 20 + paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
				ballSpeedX = -ballSpeedX;
			}

			if (ballX + ballSize > canvas.width - 20 - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
				ballSpeedX = -ballSpeedX;
			}

			// Scoring
			if (ballX < 0) {
				player2Score++;
				resetBall();
			} else if (ballX > canvas.width) {
				player1Score++;
				resetBall();
			}

			if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
				gameOver = true;
				if (state.mode === "tourn") {
					if (state.game == 0) {
						state.game = 1;
						player1Score >= WINNING_SCORE ? state.score++ : state.score2++;
						state.winner = player1Score >= WINNING_SCORE ? state.user.login : state.user2;
						localStorage.setItem("pongAppState", JSON.stringify(state));
						h2.innerHTML = `${state?.user?.login || "Player1"} VS ${state?.user3 || "Player3"}`;
						btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
						score.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
					} else if (state.game == 1) {
						state.game = 2;
						player1Score >= WINNING_SCORE ? state.score++ : state.score3++;
						state.winner = player1Score >= WINNING_SCORE ? state.user.login : state.user3;
						localStorage.setItem("pongAppState", JSON.stringify(state));
						h2.innerHTML = `${state?.user2 || "Player2"} VS ${state?.user3 || "Player3"}`;
						btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
						score.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
					} else if (state.game == 2) {
						state.game = 0;
						player1Score >= WINNING_SCORE ? state.score2++ : state.score3++;
						state.winner = sortWinner(state);
						if (state.winner[0].score == 1) {
							frame.innerHTML = `<h3 class="pix pulsar" style="color: white">No Winners</h3>`;
						} else {
							frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner[0].player}</h3>`;
						}
						localStorage.setItem("pongAppState", JSON.stringify(state));
						btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button> <button onclick="renderStep(1)">Change Options</button>`;
						score.innerHTML = `<div>Score</div> <div>1 - ${state.winner[0].player} : ${state.winner[0].score}</div><div>2 - ${state.winner[1].player} : ${state.winner[1].score}</div><div>3 - ${state.winner[2].player} : ${state.winner[2].score}</div>`;
					}
				} else if (state.mode === "human") {
					state.winner = player1Score >= WINNING_SCORE ? state.user.login : state.user2;
					localStorage.setItem("pongAppState", JSON.stringify(state));
					frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
					btns.innerHTML = `<button onclick="renderStep(2)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
				} else {
					state.winner = player1Score >= WINNING_SCORE ? state.user.login : "Bot";
					localStorage.setItem("pongAppState", JSON.stringify(state));
					frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
					btns.innerHTML = `<button onclick="renderStep(2)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
				}
			}
		}

		// Draw objects on canvas
		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw ball
			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
			ctx.fill();

			// Draw paddles
			ctx.fillRect(20, player1Y, paddleWidth, paddleHeight);
			ctx.fillRect(canvas.width - 20 - paddleWidth, player2Y, paddleWidth, paddleHeight);

			// Draw score
			ctx.font = "30px Arial";
			ctx.fillStyle = "#fff";
			ctx.fillText(player1Score, canvas.width / 4, 50);
			ctx.fillText(player2Score, (3 * canvas.width) / 4, 50);
		}

		// Reset ball position and speed
		function resetBall() {
			ballX = canvas.width / 2;
			ballY = canvas.height / 2;
			ballSpeedX = initialBallSpeed * (Math.random() < 0.5 ? 1 : -1);
			ballSpeedY = initialBallSpeed * (Math.random() < 0.5 ? 1 : -1);
		}

		// Start the game
		gameLoop();
	}
}
