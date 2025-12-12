// import { sleep } from "./lib/utils.js";
// import { Game } from "./src/Game.js";
// import { Guardian } from "./src/roles/Guardian.js";
// import { Werewolf } from "./src/roles/Werewolf.js";
// import type { GameSettings } from "./src/Types.js";

// const GAME_SETTINGS: GameSettings = {
// 	MIN_PLAYERS: 5,
// 	MAX_PLAYERS: 10,
// 	WAIT_TIME: 10,
// 	NOTIFY_TIME: 3,
// 	DAY_TIME: 5,
// 	LYNCH_TIME: 5,
// 	NIGHT_TIME: 5,
// };

// async function test() {
// 	const game = new Game("game-id123", GAME_SETTINGS);
// 	let startedGame: Game | undefined;

// 	game.events.on("game.initialized", ({ game }) => {
// 		startedGame = game;
// 		console.log("Game initialized with ID:", game.id);
// 	});

// 	game.events.on("game.winner", ({ winner }) => {
// 		console.log("Game winner:", winner);
// 	});

// 	game.events.on("player.joined", ({ player }) => {
// 		console.log("Player joined:", player.id);
// 	});
// 	game.events.on("player.notify", ({ newPlayers, players }) => {
// 		const newPlayerText =
// 			newPlayers.length > 0
// 				? `New players: ${newPlayers.map((player) => player.name).join(", ")}`
// 				: "";
// 		const playerText =
// 			players.length > 0
// 				? `Players: ${players.map((player) => player.name).join(", ")}`
// 				: "";
// 		console.log(`${newPlayerText}\n${playerText}`);
// 	});

// 	game.events.on("game.cancelled", () => console.log("Game cancelled"));

// 	game.events.on("phase.day", ({ players, dayPlayers }) => {
// 		console.log("Day phase started. Game days: ", startedGame?.days);
// 		let playersText = "Alive players:";
// 		let dayPlayersText = "Day players:";
// 		console.log(
// 			playersText,
// 			players.map((player) => player.name).join(", "),
// 		);
// 		console.log(
// 			dayPlayersText,
// 			dayPlayers.map((player) => player.name).join(", "),
// 		);
// 	});

// 	game.events.on("phase.night", async ({ players, nightPlayers }) => {
// 		console.log("Night phase started.");
// 		let playersText = "Alive players:";
// 		let nightPlayersText = "Night players:";
// 		console.log(
// 			playersText,
// 			players.map((player) => player.name).join(", "),
// 		);
// 		console.log(
// 			nightPlayersText,
// 			nightPlayers.map((player) => player.name).join(", "),
// 		);

// 		await sleep(2000);
// 	});

// 	game.events.on("phase.lynch", ({ players, lynchPlayers }) => {
// 		console.log("Lynch phase started.");
// 		let playersText = "Alive players:";
// 		let lynchPlayersText = "Lynch players:";
// 		console.log(
// 			playersText,
// 			players.map((player) => player.name).join(", "),
// 		);
// 		console.log(
// 			lynchPlayersText,
// 			lynchPlayers.map((player) => player.name).join(", "),
// 		);

// 		players.forEach((player) => {
// 			const availableTargets = players.filter((p) => p.id !== player.id);
// 			const randomTarget =
// 				availableTargets[
// 					Math.floor(Math.random() * availableTargets.length)
// 				];
// 			player.votePlayer(randomTarget!, game.events);
// 		});
// 	});

// 	game.events.on("player.role", ({ player }) => {
// 		console.log(
// 			`Player ${player.name} has been assigned the role of ${player.role?.name}`,
// 		);
// 	});

// 	game.events.on("player.lynched", ({ player }) => {
// 		if (!player) return console.log("No player being lynch today");
// 		console.log(`Player ${player.name} has been lynched.`);
// 	});

// 	game.events.on("werewolf.kill", ({ target }) => {
// 		console.log(`Werewolf killed ${target.name}`);
// 	});

// 	game.events.on("seer.info", ({ target }) => {
// 		console.log(
// 			`Seer has learned about ${target.name} and its ${target.role instanceof Werewolf ? "werewolf" : "not a werewolf"}`,
// 		);
// 	});

// 	game.events.on("guard.protect", ({ isSuccess }) => {
// 		if (!isSuccess) return console.log("Guard failed to protect");
// 		console.log("Guard successfully protected");
// 	});

// 	await sleep(3000);
// 	game.addPlayer("p1", "Indah");
// 	game.addPlayer("p2", "Putriana");
// 	await sleep(3000);
// 	game.addPlayer("p3", "Sarah");
// 	game.addPlayer("p4", "Dyah");
// 	await sleep(3000);
// 	game.addPlayer("p5", "Gadis");
// }

// test();
