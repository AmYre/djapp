function displayPlayer1() {
	const state = JSON.parse(localStorage.getItem("pongAppState"));

	const p1b = document.getElementById("p1bot");
	const p1h = document.getElementById("p1human");
	const p1t = document.getElementById("p1tourn");
	p1b.innerHTML = state.user?.login;
	p1h.innerHTML = state.user?.login;
	p1t.innerHTML = state.user?.login;
}

function handleModeForm(form) {
	const formData = new FormData(form);
	const values = Object.fromEntries(formData.entries());
	console.log("Form values:", values);

	updateState({
		currentStep: 2,
		user2: values.p2,
		user3: values.p3,
		mode: values.mode,
	});
}

function displayAvatar() {
	const user = JSON.parse(localStorage.getItem("user"));
	const avatar = document.getElementById("avatar-img");
	avatar.src = user.image.link;

	const login = document.getElementById("avatar-name");
	login.innerHTML = user.login;
}
