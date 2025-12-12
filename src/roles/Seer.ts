import type { GameEvent } from "../Event.js";
import type { Player } from "../Player.js";
import {
	GameTime,
	type ActionResult,
	type GameEventsMap,
	type RoleTier,
	type Teams,
} from "../Types.js";
import { Role } from "./Role.js";

export class Seer extends Role {
	public name = "Seer";
	public tier = "B" as RoleTier;
	public team = "villager" as Teams;
	public description =
		"A seer is a villager that can learn the behavior of other players in game.";
	public activeTime = GameTime.NIGHT;
	public isTested = false;

	async action(
		actor?: Player,
		target?: Player,
		eventGame?: GameEvent<GameEventsMap>,
	): Promise<ActionResult> {
		// Seer only can see either target is werewolf or not
		if (
			!actor ||
			!target ||
			actor.target ||
			!eventGame ||
			target.id === actor.id
		) {
			return {
				isSuccess: false,
				reason: "invalid_request",
			};
		} else if (target.isJustKilled) {
			return {
				isSuccess: false,
				reason: "was_dead",
			};
		} else {
			return {
				isSuccess: true,
				result: `${target.name} is ${target.role?.team === "werewolf" ? "a werewolf" : "not a werewolf"}.`,
			};
		}
	}
}
