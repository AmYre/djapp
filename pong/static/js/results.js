function displayWinner() {
	const winnerElement = document.getElementById("winner");
	const state = JSON.parse(localStorage.getItem("pongAppState"));

	winnerElement.innerHTML = state.winner;
}
