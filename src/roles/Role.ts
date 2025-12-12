import type { GameEvent } from "../Event.js";
import type { Player } from "../Player.js";
import type {
	ActionResult,
	GameEventsMap,
	GameTime,
	RoleTier,
	Teams,
} from "../Types.js";

export abstract class Role {
	abstract name: string;
	abstract description: string;
	abstract tier: RoleTier;
	abstract team: Teams;
	abstract activeTime: GameTime | null | undefined;
	abstract isTested: boolean;
	abstract action(
		actor?: Player,
		target?: Player,
		eventGame?: GameEvent<GameEventsMap>,
	): Promise<ActionResult | null | undefined>;
}
