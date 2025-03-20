document.addEventListener('DOMContentLoaded', () => {
	let select = document.getElementById("langSelector");

	select.addEventListener('change', (event) => {
		const selected = event.target.value;
		const elements = document.querySelectorAll('[data-lang]');

        // Update each element with the corresponding text
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            element.textContent = window.lang[selected][key];
        });
	});
});