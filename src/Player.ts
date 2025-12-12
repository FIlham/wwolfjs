import type { GameEvent } from "./Event.js";
import type { Role } from "./roles/Role.js";
import type { GameEventsMap } from "./Types.js";

export class Player {
	public id: string;
	public name: string;
	public role: Role | null | undefined;
	public isDead = false;
	public isGuarded = false;
	public isJustKilled = false;
	public target: Player | null | undefined = null;
	public killedBy: Role | "voted" | null | undefined = null;
	public votes: number = 0;
	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	public votePlayer(target: Player, eventGame: GameEvent<GameEventsMap>) {
		if (target.id === this.id) return;
		target.votes++;
		console.log(`Player ${this.name} voted for ${target.name}`);
		eventGame.emit("player.vote", { player: this, target });
	}
}
