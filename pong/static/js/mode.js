function handleModeForm(form) {
	const formData = new FormData(form);
	const values = Object.fromEntries(formData.entries());
	console.log("Form values:", values);

	updateState({
		currentStep: 3,
		user: values.p1,
		user2: values.p2,
		user3: values.p3,
		mode: values.mode,
	});
}
