let defaultLang = localStorage.getItem("lang");
if (!defaultLang)
{
    localStorage.setItem("lang", "en");
}


document.addEventListener('DOMContentLoaded', () => {
	let select = document.getElementById("langSelector");

	select.addEventListener('change', (event) => {
		const selected = event.target.value;
		const elements = document.querySelectorAll('[data-lang]');
        localStorage.setItem("lang", selected);
            // Update each element with the corresponding text
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            element.textContent = window.lang[selected][key];
        });
	});

});

function applyTranslation(){
    let lang = localStorage.getItem("lang");
    console.log("HEEEy", lang);
    // const lang = event.target.value; recupere la lang du localstorage
    const elements = document.querySelectorAll('[data-lang]');
        // Update each element with the corresponding text
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = window.lang[lang][key];
    });
}