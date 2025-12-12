export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const randomPick = (array: any[]) => {
	return array[Math.floor(Math.random() * array.length)];
};

export const shuffle = (array: any[]) => {
	let currentIndex = array.length;
	let randomIndex: number;

	// While there remain elements to shuffle.
	while (currentIndex !== 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
};
