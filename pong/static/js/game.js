function initGame() {
	const canvas = document.getElementById("gameCanvas");
	console.log("Canvas:", canvas);
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
			requestAnimationFrame(gameLoop);
			update();
			draw();
		}

		// Update game logic
		function update() {
			// Player movement
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
				resetBall();
			} else if (ballX > canvas.width) {
				player1Score++;
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
