import { type RoleTier, type Teams } from "../Types.js";
import { Role } from "./Role.js";

export class Villager extends Role {
	public name = "Villager";
	public tier = "C" as RoleTier;
	public team = "villager" as Teams;
	public description = "A villager is a neutral role that does nothing.";
	public activeTime = null;
	public isTested = false;

	async action() {
		// Villager do nothing
		return null;
	}
}
