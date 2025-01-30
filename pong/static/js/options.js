function displayUser() {
	setTimeout(() => {
		const state = localStorage.getItem("pongAppState");
		console.log("displayUser");
		let avatar = document.getElementById("avatar");
		let login = document.getElementById("login");
		avatar.src = state.user?.image?.link;
		login.innerHTML = state.user?.login;
		console.log("État options charge après délai:", state.user);
	}, 2000);
}
