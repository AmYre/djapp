// State management
const AppState = {
	currentStep: 0,
	user: null,
	gameOptions: null,
};

// Load initial state from localStorage if available
function loadInitialState() {
	const savedState = localStorage.getItem("pongAppState");
	if (savedState) {
		try {
			const parsedState = JSON.parse(savedState);
			Object.assign(AppState, parsedState);
		} catch (e) {
			console.error("Error loading saved state:", e);
			localStorage.removeItem("pongAppState");
		}
	}
}

// Views configuration
const views = {
	0: { path: "/static/pages/home.html" },
	1: { path: "/static/pages/options.html" },
	2: { path: "/static/pages/mode.html" },
	3: { path: "/static/pages/game.html" },
	4: { path: "/static/pages/results.html" },
};

// Fetch and render HTML content
async function fetchView(path) {
	try {
		const response = await fetch(path);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		return await response.text();
	} catch (error) {
		console.error("Error loading view:", error);
		return "<p>Error loading content</p>";
	}
}

// State management functions
async function updateState(newState) {
	Object.assign(AppState, newState);
	localStorage.setItem("pongAppState", JSON.stringify(AppState));
	await renderCurrentStep();
}

async function renderCurrentStep(step) {
	const mainContent = document.body;
	const view = views[step];

	if (!view) return;

	// Fetch and process the HTML content
	const html = await fetchView(view.path);
	console.log("HTML:", html);
	mainContent.innerHTML = html.replace("${login}", AppState.user?.login).replace("${avatar}", AppState.user?.image.link);
}

// Navigation functions
function nextStep() {
	if (AppState.currentStep < Object.keys(views).length - 1) {
		updateState({ currentStep: AppState.currentStep + 1 });
	}
}

function goToStep(step) {
	if (step >= 0 && step < Object.keys(views).length) {
		updateState({ currentStep: step });
	}
}

function logout() {
	localStorage.removeItem("pongAppState");
	updateState({
		currentStep: 0,
		user: null,
		gameOptions: null,
	});
	renderCurrentStep(0);
}

// URL handling for the OAuth redirect

// Event listener for when the page loads
document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get("code");

	console.log("code : ", code);

	if (code) {
		localStorage.setItem("code", code);
		localStorage.setItem("state", 1);
		window.history.replaceState({}, document.title, window.location.pathname);

		fetch("/api/token/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code: code }),
		})
			.then((response) => response.json())
			.then((data) => {
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("logged", "true");
				console.log("Token data:", data.access_token);
				url = "https://api.intra.42.fr/v2/me";
				(headers = {
					Authorization: `Bearer ${data.access_token}`,
				}),
					fetch(url, {
						method: "GET",
						headers: headers,
					})
						.then((response) => response.json())
						.then((data) => {
							console.log("User data:", data);
							localStorage.setItem("user", JSON.stringify(data));
							updateState({ user: data });
							renderCurrentStep(1);
						})
						.catch((error) => {
							console.error("Error:", error);
						});
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
});

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	if (event.state?.step !== undefined) {
		goToStep(event.state.step);
	}
});
