// This is example of wwolf-engine

import { sleep } from "./lib/utils.js";
import { Game } from "./src/Game.js";
import { Guardian } from "./src/roles/Guardian.js";
import { Werewolf } from "./src/roles/Werewolf.js";
import type { GameSettings } from "./src/Types.js";

const gameSettings: GameSettings = {
	MAX_PLAYERS: 10,
	MIN_PLAYERS: 5,
	WAIT_TIME: 5, // 5 seconds
	NOTIFY_TIME: 2, // 2 seconds
	DAY_TIME: 3, // 3 seconds
	NIGHT_TIME: 3, // 3 seconds
	LYNCH_TIME: 3, // 3 seconds
};

async function example() {
	const game = new Game("game-testing-id-123", gameSettings);
	let startedGame: Game | null;

	// When game initialized/started
	game.events.on("game.initialized", ({ game }) => {
		startedGame = game;
		console.log("Game initialized with ID:", game.id);
	});

	// When game cancelled
	game.events.on("game.cancelled", () => {
		console.log("Game cancelled");
	});

	// Game win
	game.events.on("game.winner", ({ winner }) => {
		console.log("Game winner:", winner);
	});

	game.events.on("player.joined", ({ player }) => {
		console.log("Player joined:", player.name);
	});

	game.events.on("player.notify", ({ newPlayers, players }) => {
		console.log("New players:", newPlayers.map((p) => p.name).join(", "));
		console.log("Players:", players.map((p) => p.name).join(", "));
	});

	game.events.on("game.news", (news) => {
		const reason =
			news.reason === "killed_by_werewolf"
				? "Killed by werewolf"
				: news.reason === "voted"
					? "Got lynched"
					: "";
		if (news.isDead) {
			console.log(`${news.victim.name} ${reason}`);
		}
	});

	game.events.on("player.lynched", ({ player }) => {
		if (!player) return console.log("There is no player to be lynched");
		console.log("Player lynched:", player.name);
	});

	game.events.on("player.role", ({ player }) => {
		console.log(`${player.name} has role ${player.role?.name}`);
	});

	// On the day phase
	game.events.on("phase.day", ({ players, dayPlayers }) => {
		console.log("Day started", startedGame?.days);
		console.log("Alive players:", players.map((p) => p.name).join(", "));
		console.log("Day players:", dayPlayers.map((p) => p.name).join(", "));

		// Action for day phase (random)
		dayPlayers.forEach((player) => {
			const availableTargets = players.filter((p) => p.id !== player.id);
			const randomTarget =
				availableTargets[
					Math.floor(Math.random() * availableTargets.length)
				];
			if (randomTarget) {
				player.role
					?.action(player, randomTarget, game.events)
					.then((res) => {
						if (res?.isSuccess) {
							console.log(res.result || "Action success");
						} else {
							console.log(res?.reason);
						}
					});
			}
		});
	});

	// On lynch phase
	game.events.on("phase.lynch", ({ lynchPlayers, players }) => {
		console.log("Lynch phase started");
		console.log("Alive players:", players.map((p) => p.name).join(", "));
		console.log(
			"Lynch players:",
			lynchPlayers.map((p) => p.name).join(", "),
		);

		// Action for lynch phase (random)
		lynchPlayers.forEach((player) => {
			const availableTargets = players.filter((p) => p.id !== player.id);
			const randomTarget =
				availableTargets[
					Math.floor(Math.random() * availableTargets.length)
				];
			if (randomTarget) {
				player.role
					?.action(player, randomTarget, game.events)
					.then((res) => {
						if (res?.isSuccess) {
							console.log(res.result || "Action success");
						} else {
							console.log(res?.reason);
						}
					});
			}
		});

		// Vote for every player
		players.forEach((player) => {
			const availableTargets = players.filter((p) => p.id !== player.id);
			const randomTarget =
				availableTargets[
					Math.floor(Math.random() * availableTargets.length)
				];
			if (randomTarget) {
				player.votePlayer(randomTarget, game.events);
			}
		});
	});

	// On night phase
	game.events.on("phase.night", ({ nightPlayers, players }) => {
		console.log("Night started");
		console.log("Alive players:", players.map((p) => p.name).join(", "));
		console.log(
			"Night players:",
			nightPlayers.map((p) => p.name).join(", "),
		);

		// Action for night phase (random)
		nightPlayers.forEach((player) => {
			const availableTargets = players.filter(
				(p) =>
					p.id !== player.id &&
					(player.role instanceof Werewolf
						? !(p.role instanceof Werewolf)
						: true),
			);
			const randomTarget =
				availableTargets[
					Math.floor(Math.random() * availableTargets.length)
				];
			if (randomTarget) {
				player.role
					?.action(player, randomTarget, game.events)
					.then((res) => {
						if (res?.isSuccess) {
							console.log(res.result || "Action success");
						} else {
							console.log(res?.reason);
						}
					});
			}
		});
	});

	// Players join
	game.addPlayer("p1", "Name1");
	await sleep(100);
	game.addPlayer("p2", "Name2");
	await sleep(100);
	game.addPlayer("p3", "Name3");
	await sleep(100);
	game.addPlayer("p4", "Name4");
	await sleep(100);
	game.addPlayer("p5", "Name5");
	await sleep(100);
}

example();
