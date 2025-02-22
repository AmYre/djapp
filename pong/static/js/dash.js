document.addEventListener("DOMContentLoaded", function () {
	var ctx = document.getElementById("myChart").getContext("2d");
	var myChart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: ["Bot", "Human", "Tournament"],
			datasets: [
				{
					backgroundColor: ["white", "grey", "black"],
					data: [12, 19, 3],
				},
			],
		},
		options: {
			plugins: {
				legend: {
					labels: {
						font: {
							size: 58,
							family: "'Press Start 2P', cursive",
							weight: "bold",
						},
						color: "white",
						boxWidth: 40,
						boxHeight: 40,
					},
				},
			},
		},
	});

	setTimeout(function start() {
		$(".bar").each(function (i) {
			var $bar = $(this);
			$(this).append('<span class="count"></span>');
			setTimeout(function () {
				$bar.css("width", $bar.attr("data-percent"));
			}, i * 100);
		});

		$(".count").each(function () {
			$(this)
				.prop("Counter", 0)
				.animate(
					{
						Counter: $(this).parent(".bar").attr("data-percent"),
					},
					{
						duration: 2000,
						easing: "swing",
						step: function (now) {
							$(this).text(Math.ceil(now) + "%");
						},
					}
				);
		});
	}, 500);
});
