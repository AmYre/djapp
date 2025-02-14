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

	if (values.mode === "bot") {
		const cab1 = document.getElementById("cab1");
		cab1.style.display = "block";
		cab1.classList.add("zoom1");
	} else if (values.mode === "human") {
		const cab2 = document.getElementById("cab2");
		cab2.style.display = "block";
		cab2.classList.add("zoom2");
	} else if (values.mode === "tourn") {
		const cab3 = document.getElementById("cab3");
		cab3.style.display = "block";
		cab3.classList.add("zoom3");
	}

	// setTimeout(() => {
	updateState({
		currentStep: 2,
		user2: values.p2,
		user3: values.p3,
		mode: values.mode,
		options: { bspeed: values.bspeed, bsize: values.bsize, pheight: values.pheight, pspeed: values.pspeed, spacewars: values.spacewars },
	});
	// }, 2000);
}

function displayAvatar() {
	const user = JSON.parse(localStorage.getItem("user"));
	const avatar = document.getElementById("avatar-img");
	avatar.src = user.image.link;

	const login = document.getElementById("avatar-name");
	login.innerHTML = user.login;
}
