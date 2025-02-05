function displayPlayers() {
	const h2 = document.getElementById("versus");
	const state = JSON.parse(localStorage.getItem("pongAppState"));
	const mode = state?.mode;
	if (mode === "bot") h2.innerHTML = `${state?.user?.login || "Player1"} VS Bot`;
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

	btns.innerHTML = "";

	if (canvas) {
		const canvas = document.getElementById("gameCanvas");
		const ctx = canvas.getContext("2d");

		// Game settings
		const paddleHeight = 100;
		const paddleWidth = 20;
		const ballSize = 10;
		const paddleSpeed = 5;
		const initialBallSpeed = 5;

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

		// Game loop
		function gameLoop() {
			if (!gameOver) {
				requestAnimationFrame(gameLoop);
				update();
				draw();
			}
		}

		// Update game logic
		function update() {
			if (keysPressed["w"]) player1Y -= paddleSpeed;
			if (keysPressed["s"]) player1Y += paddleSpeed;
			if (keysPressed["ArrowUp"]) player2Y -= paddleSpeed;
			if (keysPressed["ArrowDown"]) player2Y += paddleSpeed;

			// Keep paddles within bounds
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
				console.log("STATUS", state);
				if (player2Score >= WINNING_SCORE) {
					gameOver = true;
					if (state.mode === "tourn") {
						if (state.game == 0) {
							state.game = 1;
							state.score2 = 1;
							state.winner = state.user2;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							h2.innerHTML = `${state?.user?.login || "Player1"} VS ${state?.user3 || "Player3"}`;
							btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score} </div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score3}</div>`;
						} else if (state.game == 1) {
							state.game = 2;
							state.score3 = 1;
							state.winner = state.user3;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							h2.innerHTML = `${state?.user2 || "Player2"} VS ${state?.user3 || "Player3"}`;
							btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score}</div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score3}</div>`;
						} else if (state.game == 2) {
							state.game = 0;
							state.score3 = state.score3 + 1;
							state.winner = state.user3;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
							btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button> <button onclick="renderStep(1)">Change Options</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score}</div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score3}</div>`;
						}
					} else if (state.mode === "human") {
						state.winner = state.user2;
						localStorage.setItem("pongAppState", JSON.stringify(state));
						frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
						btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
					} else {
						state.winner = "Bot";
						localStorage.setItem("pongAppState", JSON.stringify(state));
						frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
						btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
					}
				}
				resetBall();
			} else if (ballX > canvas.width) {
				player1Score++;
				if (player1Score >= WINNING_SCORE) {
					gameOver = true;
					if (state.mode === "tourn") {
						if (state.game == 0) {
							state.game = 1;
							state.score = 1;
							state.winner = state.user.login;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							h2.innerHTML = `${state?.user?.login || "Player1"} VS ${state?.user3 || "Player3"}`;
							btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score}</div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score}</div>`;
						} else if (state.game == 1) {
							state.game = 2;
							state.score = state.score + 1;
							state.winner = state.user.login;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							h2.innerHTML = `${state?.user2 || "Player2"} VS ${state?.user3 || "Player3"}`;
							btns.innerHTML = `<button onclick="initGame()">Next Game</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score}</div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score3}</div>`;
						} else if (state.game == 2) {
							state.game = 0;
							state.score2 = state.score2 + 1;
							state.winner = state.user3;
							localStorage.setItem("pongAppState", JSON.stringify(state));
							frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
							btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button> <button onclick="renderStep(1)">Change Options</button>`;
							score.innerHTML = `<div>Score</div> <div>${state.user.login} : ${state.score}</div><div>${state.user2} : ${state.score2}</div></div><div>${state.user3} : ${state.score3}</div>`;
						}
					} else if (state.mode === "human") {
						state.winner = state.user.login;
						localStorage.setItem("pongAppState", JSON.stringify(state));
						console.log("STATUS", state);
						frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
						btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
					} else {
						state.winner = state.user.login;
						try {
							localStorage.setItem("pongAppState", JSON.stringify(state));
							// Vérifier immédiatement si la sauvegarde a fonctionné
							const savedState = localStorage.getItem("pongAppState");
							console.log("État sauvegardé:", JSON.parse(savedState));
						} catch (error) {
							console.error("Erreur lors de la sauvegarde:", error);
						}
						console.log("STATUS", state);
						frame.innerHTML = `<h3 class="pix pulsar" style="color: white">Winner is ${state.winner}</h3>`;
						btns.innerHTML = `<button onclick="renderStep(3)">Play Again</button>
	<button onclick="renderStep(1)">Change Options</button>`;
					}
				}
				resetBall();
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
