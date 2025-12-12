import { INSPECT_MAX_BYTES } from "node:buffer";
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
import { Guardian } from "./Guardian.js";

export class Werewolf extends Role {
	public name = "Werewolf";
	public description =
		"The Werewolf is a powerful role that can kill other players during the night.";
	public tier = "A" as RoleTier;
	public team = "werewolf" as Teams;
	public activeTime = GameTime.NIGHT;
	public isTested = false;

	async action(
		actor?: Player,
		target?: Player,
		eventGame?: GameEvent<GameEventsMap>,
	): Promise<ActionResult> {
		// Werewolf cannot kill other werewolf,
		// cannot kill itself,
		// cannot kill player who has a target (player not home),
		// cannot kill guardian (either guarded player or not)
		if (
			!actor ||
			!target ||
			!eventGame ||
			target.role?.team === "werewolf" ||
			actor.id == target.id
		) {
			return {
				isSuccess: false,
				reason: "invalid_request",
			};
		} else if (target.target) {
			return {
				isSuccess: false,
				reason: "not_home",
			};
		} else if (
			target.isGuarded ||
			(target.role instanceof Guardian && !target.target)
		) {
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
			target.isDead = true;
			target.isJustKilled = true;
			target.killedBy = this;
			return {
				isSuccess: true,
			};
		}
	}
}
