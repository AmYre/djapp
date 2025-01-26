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
