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
import { Werewolf } from "./Werewolf.js";

export class Guardian extends Role {
	public name = "Guardian";
	public tier = "A" as RoleTier;
	public team = "villager" as Teams;
	public description =
		"A guardian is a role that protects the village from werewolves.";
	public activeTime = GameTime.NIGHT;
	public isTested = false;

	async action(
		actor?: Player,
		target?: Player,
		eventGame?: GameEvent<GameEventsMap>,
	): Promise<ActionResult> {
		// Guardian can protect one player at night
		// It can't be killed by werewolves neither when protected player or not
		// Guardian failed protect player when it just died
		// Can't target player when it has target (player not home)
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
		}
		if (target.target) {
			return {
				isSuccess: false,
				reason: "not_home",
			};
		}
		if (target.role instanceof Werewolf && !target.target) {
			return {
				isSuccess: false,
				reason: "got_attacked",
			};
		} else if (target.isJustKilled) {
			return {
				isSuccess: false,
				reason: "was_dead",
			};
		} else {
			actor.target = target;
			target.isGuarded = true;
			return {
				isSuccess: true,
			};
		}
	}
}
