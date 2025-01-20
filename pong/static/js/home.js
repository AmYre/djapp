// State management
const AppState = {
	currentStep: 0,
	user: null,
	gameOptions: null,
};

// Views configuration
const views = {
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

	// If the step is changing, update browser history
	if (newState.currentStep !== undefined) {
		window.history.pushState({ step: newState.currentStep }, "", "/");
	}

	await renderCurrentStep(newState.currentStep);
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

async function renderCurrentStep(step) {
	let AppState = JSON.parse(localStorage.getItem("pongAppState"));
	console.log("AppState:", AppState);
	const mainContent = document.body;
	const view = views[step];

	if (!view) return;

	// Fetch and process the HTML content
	const html = await fetchView(view.path);
	mainContent.innerHTML = html.replace("${login}", AppState.user?.login).replace("${avatar}", AppState.user?.image.link);
}

async function renderStep(step) {
	const mainContent = document.body;
	const view = views[step];
	console.log("View:", view);
	console.log("Step:", step);
	if (!view) return;
	Object.assign(AppState, { currentStep: step });
	localStorage.setItem("pongAppState", JSON.stringify(AppState));
	window.history.pushState({ step: step }, "", "/");
	// Fetch and process the HTML content
	const html = await fetchView(view.path);
	mainContent.innerHTML = html.replace("${login}", AppState.user?.login).replace("${avatar}", AppState.user?.image.link);
}

async function renderHome() {
	window.history.pushState({ step: 0 }, "", "/");
	const html = await fetchView("/static/pages/home.html");
	document.body.innerHTML = html;
}

// Navigation functions
function nextStep() {
	console.log("Current step:", AppState.currentStep);
	if (AppState.currentStep < Object.keys(views).length) {
		console.log("New step", AppState.currentStep + 1);
		updateState({ currentStep: AppState.currentStep + 1 });
	}
}

function previousStep() {
	console.log("Current step:", AppState.currentStep);
	if (AppState.currentStep > 0) {
		console.log("New step", AppState.currentStep - 1);
		updateState({ currentStep: AppState.currentStep - 1 });
	}
}

function goToStep(step) {
	if (step >= 0 && step < Object.keys(views).length) {
		updateState({ currentStep: step });
	}
}

function logout() {
	localStorage.clear();
	renderHome();
}

// URL handling for the OAuth redirect

// Event listener for when the page loads
document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get("code");

	const savedState = localStorage.getItem("pongAppState");
	if (savedState) {
		const parsedState = JSON.parse(savedState);
		Object.assign(AppState, parsedState);
		console.log("Restored state:", AppState.currentStep);
		renderStep(AppState.currentStep);
	} else {
		if (code) {
			localStorage.setItem("code", code);
			localStorage.setItem("state", 1);

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
								updateState({ currentStep: 1, user: data, gameOptions: null });
							})
							.catch((error) => {
								console.error("Error:", error);
							});
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		}
	}
});

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	// Get the step from the event state, fallback to 0 if not found
	console.log("Popstate", event, "event:", event.state);
	const step = event.state?.step ?? 0;

	// Update AppState without pushing to history (to avoid loops)
	Object.assign(AppState, { currentStep: step });
	renderCurrentStep(step);
});
