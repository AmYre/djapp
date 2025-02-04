function displayUser() {
	const state = JSON.parse(localStorage.getItem("pongAppState"));

	let avatar = document.getElementById("avatar");
	let login = document.getElementById("login");
	avatar.src = state.user?.image?.link;
	login.innerHTML = state.user?.login;
}
