// State management
let AppState = {
	currentStep: 0,
	user: null,
	score: 0,
	user2: null,
	score2: 0,
	user3: null,
	score3: 0,
	mode: null,
	winner: "",
	game: 0,
	gameOptions: null,
};

// Views configuration
let views = {
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

// Execute scripts in the content
function execScripts(content) {
	const scripts = content.getElementsByTagName("script");
	Array.from(scripts).forEach((script) => {
		const newScript = document.createElement("script");
		Array.from(script.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
		newScript.textContent = script.textContent;
		script.parentNode.replaceChild(newScript, script);
	});
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

	const html = await fetchView(view.path);
	mainContent.innerHTML = html;
	execScripts(mainContent);
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
	execScripts(mainContent);
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

async function logOut() {
	localStorage.clear();
	window.history.pushState({ step: 0 }, "", "/");
	const html = await fetchView("/static/pages/notHome.html");
	document.body.innerHTML = html;
	execScripts(document.body);
	sliderInit();
}

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	// Get the step from the event state, fallback to 0 if not found
	console.log("Popstate", event, "event:", event.state);
	const step = event.state?.step ?? 0;

	// Update AppState without pushing to history (to avoid loops)
	Object.assign(AppState, { currentStep: step });
	renderCurrentStep(step);
});
