document.addEventListener("DOMContentLoaded", function () {
	console.log("Balls.js loaded");
	class PhysicsBallContainer {
		constructor(containerId, numGames) {
			// Matter.js module aliases
			this.Engine = Matter.Engine;
			this.Render = Matter.Render;
			this.World = Matter.World;
			this.Bodies = Matter.Bodies;

			// Create engine and world
			this.engine = this.Engine.create();
			this.world = this.engine.world;

			// Container dimensions
			this.width = 100;
			this.height = 200;
			this.wallThickness = 8;

			// Ball properties
			this.ballRadius = 10;
			this.ballSpawnDelay = 500; // ms between ball spawns
			this.totalBalls = numGames;
			this.spawnedBalls = 0;

			// Setup renderer
			this.render = this.Render.create({
				element: document.getElementById(containerId),
				engine: this.engine,
				options: {
					width: this.width,
					height: this.height,
					wireframes: false,
					background: "transparent",
					pixelRatio: window.devicePixelRatio,
				},
			});

			// Create container walls
			this.createWalls();

			// Start physics engine and renderer
			this.Engine.run(this.engine);
			this.Render.run(this.render);

			// Start spawning balls
			this.spawnInterval = setInterval(() => this.spawnBall(), this.ballSpawnDelay);
		}

		createWalls() {
			const walls = [
				// Bottom
				this.Bodies.rectangle(this.width / 2, this.height - this.wallThickness / 2, this.width, this.wallThickness, { isStatic: true }),
				// Left
				this.Bodies.rectangle(this.wallThickness / 2, this.height / 2, this.wallThickness, this.height, { isStatic: true }),
				// Right
				this.Bodies.rectangle(this.width - this.wallThickness / 2, this.height / 2, this.wallThickness, this.height, { isStatic: true }),
			];

			// Set wall appearance
			walls.forEach((wall) => {
				wall.render.fillStyle = "#808080";
				wall.friction = 0.2;
				wall.restitution = 0.4;
			});

			this.World.add(this.world, walls);
		}

		spawnBall() {
			if (this.spawnedBalls >= this.totalBalls) {
				clearInterval(this.spawnInterval);
				return;
			}

			// Create ball with physics properties
			const ball = this.Bodies.circle(this.width / 2, this.ballRadius * 2, this.ballRadius, {
				restitution: 0.4, // Bounciness
				friction: 0.1, // Surface friction
				density: 0.001, // Mass/weight
				render: {
					fillStyle: "#fff",
				},
			});

			// Add small random horizontal velocity for more interesting motion
			const randomVelocity = (Math.random() - 0.5) * 2;
			Matter.Body.setVelocity(ball, { x: randomVelocity, y: 0 });

			this.World.add(this.world, ball);
			this.spawnedBalls++;
		}

		cleanup() {
			// Stop the physics engine and renderer
			this.Engine.clear(this.engine);
			this.Render.stop(this.render);
			clearInterval(this.spawnInterval);
		}
	}

	// Usage:
	function initPhysicsBallAnimation(containerId, numGames) {
		// Create a div container for the canvas
		const container = document.getElementById(containerId);
		container.innerHTML = ""; // Clear any existing content

		// Create and return the physics simulation
		return new PhysicsBallContainer(containerId, numGames);
	}

	initPhysicsBallAnimation("balls", 7);
});
