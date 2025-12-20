import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Role } from "../src/roles/Role.js";
import { randomPick, shuffle } from "./utils.js";
import { Villager } from "../src/roles/Villager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically load all role classes at module initialization
async function loadRolePool(): Promise<Role[]> {
	const rolesDir = join(__dirname, "../src/roles");
	const roleFiles = readdirSync(rolesDir).filter(
		(file) =>
			(file.endsWith(".ts") || file.endsWith(".js")) &&
			file !== "Role.ts" &&
			file !== "index.ts",
	);

	const roles: Role[] = [];

	for (const file of roleFiles) {
		const modulePath = `../src/roles/${file.replace(/(\.ts|\.d\.ts)$/, ".js")}`;
		const module = await import(modulePath);

		// Get all exported classes from the module
		for (const key of Object.keys(module)) {
			const ExportedClass = module[key];
			// Check if it's a class constructor and extends Role
			if (
				typeof ExportedClass === "function" &&
				ExportedClass.prototype instanceof Role
			) {
				roles.push(new ExportedClass());
			}
		}
	}

	return roles;
}

// Load roles immediately at program start using top-level await
const ROLE_POOL: Role[] = await loadRolePool();

// Tested roles
const TESTED_ROLES = ROLE_POOL.filter((r) => r.isTested);

// Simple rules
const TIER_RULES = {
	maxSTier: 1, // Only 1 S-tier per game
	maxATier: 2, // Max 2 A-tier per game
	maxBTier: 3, // Max 3 B-tier per game
};

export function getAvailableRoles(playerCount: number) {
	const werewolfCount = Math.floor(playerCount * 0.25);
	const specialRoleCount = Math.floor(playerCount * 0.25);
	const villagerCount = playerCount - werewolfCount - specialRoleCount;

	const distribution: Role[] = [];

	// Find Werewolf and Villager classes from role pool
	const WerewolfRole = ROLE_POOL.find((r) => r.name === "Werewolf");
	const VillagerRole = ROLE_POOL.find((r) => r.name === "Villager");

	if (!WerewolfRole || !VillagerRole) {
		throw new Error("Required roles (Werewolf, Villager) not found!");
	}

	// Add werewolves
	for (let i = 0; i < werewolfCount; i++) {
		distribution.push(new (WerewolfRole.constructor as new () => Role)());
	}

	// Pick random special roles with tier limits
	const specialRoles = pickRandomRoles(specialRoleCount);
	distribution.push(...specialRoles);

	// Fill with villagers
	for (let i = 0; i < villagerCount; i++) {
		distribution.push(new (VillagerRole.constructor as new () => Role)());
	}

	shuffle(distribution); // Shuffle for randomness
	return distribution;
}

function pickRandomRoles(count: number) {
	const picked: Role[] = [];
	let available = [
		...ROLE_POOL.filter(
			(r) => r.team === "villager" && !(r instanceof Villager),
		),
		...TESTED_ROLES,
	];

	shuffle(available);

	let sTierCount = 0;
	let aTierCount = 0;
	let bTierCount = 0;

	for (let i = 0; i < count && available.length > 0; i++) {
		shuffle(available);

		// Filter by tier limits
		const candidates = available.filter((r) => {
			if (r.tier === "S" && sTierCount >= TIER_RULES.maxSTier)
				return false;
			if (r.tier === "A" && aTierCount >= TIER_RULES.maxATier)
				return false;
			if (r.tier === "B" && bTierCount >= TIER_RULES.maxBTier)
				return false;
			return true;
		});

		if (candidates.length === 0) break;

		// Random pick
		const chosen = randomPick(candidates);
		// Create a new instance of the chosen role
		picked.push(new (chosen.constructor as new () => Role)());

		// Update counters
		if (chosen.tier === "S") sTierCount++;
		if (chosen.tier === "A") aTierCount++;
		if (chosen.tier === "B") bTierCount++;

		// Remove from available to avoid duplicates
		const index = available.findIndex((r) => r.name === chosen.name);
		available.splice(index, 1);
	}

	return picked;
}
