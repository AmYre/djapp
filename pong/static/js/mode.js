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

	const cards = document.getElementById("image-format");
	cards.classList.add("shrink");

	if (values.mode == "bot") {
		const zoom = document.getElementById("hd-zoom");
		zoom.style.display = "block";
		zoom.classList.add("zoom1");
	} else if (values.mode == "human") {
		const zoom = document.getElementById("hd-zoom");
		zoom.style.display = "block";
		zoom.classList.add("zoom2");
	} else if (values.mode == "tourn") {
		const zoom = document.getElementById("hd-zoom");
		zoom.style.display = "block";
		zoom.classList.add("zoom3");
	}

	setTimeout(() => {
		updateState({
			currentStep: 2,
			user2: values.p2,
			user3: values.p3,
			mode: values.mode,
			options: { bspeed: values.bspeed, bsize: values.bsize, pheight: values.pheight, pspeed: values.pspeed, spacewars: values.spacewars },
		});
	}, 1800);
}

function displayAvatar() {
	var user = JSON.parse(localStorage.getItem("user"));
	const avatar = document.getElementById("avatar-img");
	avatar.src = user.image.link;

	const login = document.getElementById("avatar-name");
	login.innerHTML = user.login;
}

function displayUser() {
	const state = JSON.parse(localStorage.getItem("pongAppState"));

	let avatar = document.getElementById("avatar");
	let login = document.getElementById("login");
	avatar.src = state.user?.image?.link;
	login.innerHTML = state.user?.login;
}

function displayOptions() {
	document.querySelectorAll("#pspeed").forEach((r) => {
		r.addEventListener("input", (e) => {
			if (e.target.value == 0) {
				e.target.nextElementSibling.textContent = "Painful";
			} else if (e.target.value == 25) {
				e.target.nextElementSibling.textContent = "Slow";
			} else if (e.target.value == 50) {
				e.target.nextElementSibling.textContent = "Normal";
			} else if (e.target.value == 75) {
				e.target.nextElementSibling.textContent = "Quick";
			} else if (e.target.value == 100) {
				e.target.nextElementSibling.textContent = "Flash";
			}
		});
	});
	document.querySelectorAll("#pheight").forEach((r) => {
		r.addEventListener("input", (e) => {
			if (e.target.value == 0) {
				e.target.nextElementSibling.textContent = "Crazy";
			} else if (e.target.value == 25) {
				e.target.nextElementSibling.textContent = "Small";
			} else if (e.target.value == 50) {
				e.target.nextElementSibling.textContent = "Normal";
			} else if (e.target.value == 75) {
				e.target.nextElementSibling.textContent = "Big";
			} else if (e.target.value == 100) {
				e.target.nextElementSibling.textContent = "Why?";
			}
		});
	});
	document.querySelectorAll("#ballspeed").forEach((r) => {
		r.addEventListener("input", (e) => {
			if (e.target.value == 0) {
				e.target.nextElementSibling.textContent = "Boring";
			} else if (e.target.value == 25) {
				e.target.nextElementSibling.textContent = "Slow";
			} else if (e.target.value == 50) {
				e.target.nextElementSibling.textContent = "Normal";
			} else if (e.target.value == 75) {
				e.target.nextElementSibling.textContent = "Quick";
			} else if (e.target.value == 100) {
				e.target.nextElementSibling.textContent = "Lightning";
			}
		});
	});
	document.querySelectorAll("#ballsize").forEach((r) => {
		r.addEventListener("input", (e) => {
			if (e.target.value == 0) {
				e.target.nextElementSibling.textContent = "Quantic";
			} else if (e.target.value == 25) {
				e.target.nextElementSibling.textContent = "Small";
			} else if (e.target.value == 50) {
				e.target.nextElementSibling.textContent = "Normal";
			} else if (e.target.value == 75) {
				e.target.nextElementSibling.textContent = "Big";
			} else if (e.target.value == 100) {
				e.target.nextElementSibling.textContent = "Cosmic";
			}
		});
	});
}
