import type { Game } from "./Game.js";
import type { Player } from "./Player.js";

export enum Winners {
	VillagerWin = "VillagerWin",
	WerewolfWin = "WerewolfWin",
}

export type ActionFailedReason =
	| "not_home"
	| "was_dead"
	| "got_attacked"
	| "invalid_request";

export type NewsReason = "killed_by_werewolf" | "voted";

export type ActionResult = {
	isSuccess: boolean;
	reason?: ActionFailedReason;
	result?: string | any;
};

export interface GameEventsMap {
	"game.initialized": { game: Game };
	"game.cancelled": null;
	"game.winner": { winner: Winners };
	"game.news": { isDead: boolean; victim: Player; reason: NewsReason };
	"player.notify": { newPlayers: Player[]; players: Player[] };
	"player.joined": { player: Player };
	"player.role": { player: Player };
	"player.vote": { player: Player; target: Player };
	"player.lynched": { player?: Player };
	"phase.night": { players: Player[]; nightPlayers: Player[] };
	"phase.day": { players: Player[]; dayPlayers: Player[] };
	"phase.lynch": { players: Player[]; lynchPlayers: Player[] };
}

export type GameSettings = {
	MAX_PLAYERS: number;
	MIN_PLAYERS: number;
	WAIT_TIME: number;
	NOTIFY_TIME: number;
	NIGHT_TIME: number;
	DAY_TIME: number;
	LYNCH_TIME: number;
};

export enum GameTime {
	NIGHT = "night",
	DAY = "day",
	LYNCH = "lynch",
}

export type RoleTier = "S" | "A" | "B" | "C";
export type Teams = "villager" | "werewolf";
