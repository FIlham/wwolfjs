import { getAvailableRoles } from "../lib/getAvailableRoles.js";
import { shuffle, sleep } from "../lib/utils.js";
import { GameEvent } from "./Event.js";
import { Player } from "./Player.js";
import { Werewolf } from "./roles/Werewolf.js";
import {
	GameTime,
	Winners,
	type GameEventsMap,
	type GameSettings,
} from "./Types.js";

export class Game {
	private _newPlayers: Player[] = [];
	public id: string | null;
	public settings: GameSettings | null;
	public players: Player[] = [];
	public time: GameTime | null = null;
	public isStart = false;
	public days = 0;
	public events = new GameEvent<GameEventsMap>();

	constructor(id: string, gameSettings: GameSettings) {
		this.id = id;
		this.settings = gameSettings;

		this.initialize();
	}

	// #region public methods
	public async initialize() {
		await sleep(100);
		this.events.emit("game.initialized", { game: this });

		// Run game timer
		await this.gameTimer();
		// Check game to start
		await this.checkGame();

		// Check if the game still exist (cause of destroyGame in checkGame were not stopping the game)
		if (!this.id) return;

		// Distribute roles
		await this.distributeRoles();

		// Everything is done, now start the game
		this.isStart = true;
		// Run the cycle phase
		await this.startCycle();
	}

	public addPlayer(id: string, name: string) {
		if (this.isStart) return;
		if (this.players.some((p) => p.id === id)) return;
		const player = new Player(id, name);
		this.players.push(player);
		this._newPlayers.push(player);
		this.events.emit("player.joined", { player });
	}

	public getPlayers(isAlive: boolean) {
		if (isAlive) {
			return this.players.filter((player) => !player.isDead);
		} else {
			return this.players;
		}
	}
	// #endregion

	// #region private methods
	private async gameTimer() {
		for (let i = 0; i < this.settings!.WAIT_TIME; i++) {
			if (
				(i + 1) % this.settings!.NOTIFY_TIME === 0 &&
				this._newPlayers.length > 0
			) {
				this.events.emit("player.notify", {
					newPlayers: this._newPlayers,
					players: this.players,
				});
				this._newPlayers = [];
			}
			await sleep(1000);
		}
	}

	private async checkGame() {
		if (this.players.length < this.settings!.MIN_PLAYERS) {
			this.events.emit("game.cancelled", null);
			this.destroyGame();
		}
	}

	private destroyGame() {
		this.events.removeAllListeners();
		this.id = null;
		this.settings = null;
		this.players = [];
		this.time = null;
		this.isStart = false;
	}

	private async distributeRoles() {
		const availableRoles = getAvailableRoles(this.players.length);

		shuffle(availableRoles);
		shuffle(this.players);

		for (let player of this.players) {
			if (player.role) continue;
			shuffle(availableRoles);
			player.role = availableRoles.pop();
			await sleep(500);
			this.events.emit("player.role", { player });
		}

		shuffle(this.players);
	}

	private async startCycle() {
		while (this.isStart) {
			if (!this.isStart) return;
			if (await this.checkWinConditions()) return;
			await this.nightPhase();

			if (!this.isStart) return;
			if (await this.checkWinConditions()) return;
			await this.dayPhase();

			if (!this.isStart) return;
			if (await this.checkWinConditions()) return;
			await this.lynchPhase();
		}
	}

	private async nightPhase() {
		this.time = GameTime.NIGHT;
		this.events.emit("phase.night", {
			players: this.getPlayers(true),
			nightPlayers: this.getPlayers(true).filter(
				(x) => x.role?.activeTime === GameTime.NIGHT,
			),
		});
		for (let i = 0; i < this.settings!.NIGHT_TIME; i++) {
			// add some logic here
			await sleep(1000);
		}

		// Emit for news
		await this.getNews();
		// Remove an action
		for (const player of this.players) {
			player.isJustKilled = false;
			player.target = null;
			player.isGuarded = false;
		}
	}

	private async dayPhase() {
		this.time = GameTime.DAY;
		this.days++;
		this.events.emit("phase.day", {
			players: this.getPlayers(true),
			dayPlayers: this.getPlayers(true).filter(
				(x) => x.role?.activeTime === GameTime.DAY,
			),
		});
		for (let i = 0; i < this.settings!.DAY_TIME; i++) {
			// add some logic hereere
			await sleep(1000);
		}

		// Emit for news
		await this.getNews();
		// Remove an action
		for (const player of this.players) {
			player.isJustKilled = false;
			player.target = null;
			player.isGuarded = false;
		}
	}

	private async lynchPhase() {
		this.time = GameTime.LYNCH;
		this.events.emit("phase.lynch", {
			players: this.getPlayers(true),
			lynchPlayers: this.getPlayers(true).filter(
				(x) => x.role?.activeTime === GameTime.LYNCH,
			),
		});
		for (let i = 0; i < this.settings!.LYNCH_TIME; i++) {
			// add some logic here
			await sleep(1000);
		}

		// Get lynched on most most voted
		const maxVotes = Math.max(...this.getPlayers(true).map((x) => x.votes));
		if (this.players.filter((x) => x.votes === maxVotes).length > 1) {
			this.events.emit("player.lynched", {});
		} else {
			const maxVotedPlayer = this.players.find(
				(x) => x.votes === maxVotes,
			);
			if (maxVotedPlayer) {
				maxVotedPlayer.isDead = true;
				maxVotedPlayer.killedBy = "voted";
				this.events.emit("player.lynched", { player: maxVotedPlayer });
			}
		}

		// Emit for news
		await this.getNews();
		// Remove an action
		for (const player of this.players) {
			player.isJustKilled = false;
			player.target = null;
			player.isGuarded = false;
			player.votes = 0;
		}
	}

	private async checkWinConditions() {
		const alivePlayers = this.getPlayers(true);

		// Villager win: If all criminals died
		if (alivePlayers.every((player) => player.role?.team === "villager")) {
			this.events.emit("game.winner", { winner: Winners.VillagerWin });
			this.destroyGame();
			return true;
		}

		// Werewolf win: If every player is a werewolf or werewolf team players and villager team players are equal on count
		if (
			alivePlayers.every((player) => player.role?.team === "werewolf") ||
			alivePlayers.filter((player) => player.role?.team === "werewolf")
				.length ===
				alivePlayers.filter(
					(player) => player.role?.team === "villager",
				).length
		) {
			this.events.emit("game.winner", { winner: Winners.WerewolfWin });
			this.destroyGame();
			return true;
		}
	}

	private async getNews() {
		// Get news from player who just killed
		for (const player of this.players) {
			if (player.isJustKilled) {
				if (player.killedBy instanceof Werewolf)
					this.events.emit("game.news", {
						isDead: true,
						victim: player,
						reason: "killed_by_werewolf",
					});
				if (player.killedBy === "voted")
					this.events.emit("game.news", {
						isDead: true,
						victim: player,
						reason: "voted",
					});
			}
		}
	}
	// #endregion
}
