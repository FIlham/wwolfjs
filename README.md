# 🐺 WWolfJS

A TypeScript library for integrating Werewolf (Mafia) game mechanics into your applications. Build social deduction games with customizable roles, phases, and events.

## 📖 About

Werewolf is a classic social deduction party game where hidden Werewolves try to eliminate Villagers, while the uninformed Villagers try to find and lynch the Werewolves through discussion and voting. WWolfJS provides a complete game engine that handles all the core mechanics, allowing you to focus on building your user interface and game experience.

## ✨ Features

- 🎭 **Multiple Roles**: Werewolf, Villager, Guardian, Seer, and more
- 🌓 **Day/Night Cycle**: Automatic phase management with customizable timings
- 🗳️ **Voting System**: Built-in player voting and lynching mechanics
- 📡 **Event-Driven**: React to game events with a powerful event system
- ⚙️ **Configurable**: Customize game settings to fit your needs
- 🔄 **Asynchronous**: Fully async/await compatible
- 📦 **TypeScript**: Full type safety and IntelliSense support

## 📦 Installation

```bash
npm install wwolfjs
```

## 🚀 Quick Start

```typescript
import { Game, Werewolf, Guardian } from 'wwolfjs';
import type { GameSettings } from 'wwolfjs';

// Configure your game
const gameSettings: GameSettings = {
  MAX_PLAYERS: 10,
  MIN_PLAYERS: 5,
  WAIT_TIME: 30,      // Seconds to wait before starting
  NOTIFY_TIME: 10,    // Notify players every N seconds
  DAY_TIME: 60,       // Day phase duration
  NIGHT_TIME: 45,     // Night phase duration
  LYNCH_TIME: 60,     // Lynch/voting phase duration
};

// Create a new game
const game = new Game("unique-game-id", gameSettings);

// Listen to game events
game.events.on("game.initialized", ({ game }) => {
  console.log("Game started!");
});

game.events.on("player.joined", ({ player }) => {
  console.log(`${player.name} joined the game`);
});

game.events.on("player.role", ({ player }) => {
  console.log(`${player.name} is a ${player.role?.name}`);
});

// Add players
game.addPlayer("player1", "Alice");
game.addPlayer("player2", "Bob");
game.addPlayer("player3", "Charlie");
game.addPlayer("player4", "David");
game.addPlayer("player5", "Eve");
```

## 🎮 Game Phases

The game cycles through three main phases:

### 🌙 Night Phase
During the night, special roles perform their actions:
- **Werewolves** choose a victim to eliminate
- **Guardian** chooses someone to protect
- **Seer** investigates a player's role

```typescript
game.events.on("phase.night", ({ nightPlayers, players }) => {
  console.log("Night has fallen...");
  
  nightPlayers.forEach(player => {
    // Let players perform their night actions
    const target = selectTarget(players);
    player.role?.action(player, target, game.events);
  });
});
```

### ☀️ Day Phase
During the day, players discuss and gather information:

```typescript
game.events.on("phase.day", ({ dayPlayers, players }) => {
  console.log(`Day ${game.days} begins`);
  
  // Day-active roles can perform actions
  dayPlayers.forEach(player => {
    // Day phase actions
  });
});
```

### 🗳️ Lynch Phase
Players vote to eliminate a suspected Werewolf:

```typescript
game.events.on("phase.lynch", ({ lynchPlayers, players }) => {
  console.log("Time to vote!");
  
  // Each player votes
  players.forEach(player => {
    const target = chooseVoteTarget(players);
    player.votePlayer(target, game.events);
  });
});

game.events.on("player.lynched", ({ player }) => {
  if (player) {
    console.log(`${player.name} was lynched!`);
  }
});
```

## 📰 Game Events

WWolfJS provides a comprehensive event system:

| Event | Description | Data |
|-------|-------------|------|
| `game.initialized` | Game has been created | `{ game }` |
| `game.cancelled` | Game cancelled (not enough players) | `null` |
| `game.winner` | Game ended with a winner | `{ winner }` |
| `player.joined` | Player joined the game | `{ player }` |
| `player.notify` | Periodic player notification | `{ newPlayers, players }` |
| `player.role` | Player assigned a role | `{ player }` |
| `player.vote` | Player voted for someone | `{ player, target }` |
| `player.lynched` | Player was lynched | `{ player }` |
| `phase.night` | Night phase started | `{ nightPlayers, players }` |
| `phase.day` | Day phase started | `{ dayPlayers, players }` |
| `phase.lynch` | Lynch phase started | `{ lynchPlayers, players }` |
| `game.news` | News about deaths | `{ isDead, victim, reason }` |

## 🎭 Available Roles

### Werewolf 🐺
- **Team**: Werewolf
- **Active**: Night
- **Ability**: Kill a villager each night

### Villager 👤
- **Team**: Villager
- **Active**: Lynch (voting)
- **Ability**: Vote during lynch phase

### Guardian 🛡️
- **Team**: Villager
- **Active**: Night
- **Ability**: Protect one player from being killed

### Seer 🔮
- **Team**: Villager
- **Active**: Night
- **Ability**: Learn the true identity of a player

## 🎯 Win Conditions

### Villagers Win 🎉
All Werewolves have been eliminated

### Werewolves Win 🐺
Werewolves equal or outnumber Villagers

## 🔧 API Reference

### Game Class

```typescript
class Game {
  constructor(id: string, gameSettings: GameSettings)
  
  // Methods
  addPlayer(id: string, name: string): void
  getPlayers(isAlive: boolean): Player[]
  
  // Properties
  id: string
  settings: GameSettings
  players: Player[]
  time: GameTime
  isStart: boolean
  days: number
  events: GameEvent<GameEventsMap>
}
```

### Player Class

```typescript
class Player {
  constructor(id: string, name: string)
  
  // Methods
  votePlayer(target: Player, eventGame: GameEvent): void
  
  // Properties
  id: string
  name: string
  role: Role | null
  isDead: boolean
  isGuarded: boolean
  votes: number
}
```

### Role Class (Abstract)

```typescript
abstract class Role {
  abstract name: string
  abstract description: string
  abstract tier: RoleTier
  abstract team: Teams
  abstract activeTime: GameTime
  abstract action(actor?: Player, target?: Player, eventGame?: GameEvent): Promise<ActionResult>
}
```

### GameSettings Interface

```typescript
interface GameSettings {
  MAX_PLAYERS: number    // Maximum players allowed
  MIN_PLAYERS: number    // Minimum players to start
  WAIT_TIME: number      // Seconds to wait before starting
  NOTIFY_TIME: number    // Notify interval in seconds
  DAY_TIME: number       // Day phase duration
  NIGHT_TIME: number     // Night phase duration
  LYNCH_TIME: number     // Lynch phase duration
}
```

## 🎨 Creating Custom Roles

Extend the `Role` class to create your own custom roles:

```typescript
import { Role } from 'wwolfjs';
import { GameTime, RoleTier } from 'wwolfjs';

export class CustomRole extends Role {
  name = "Custom Role";
  description = "A custom role with special abilities";
  tier = RoleTier.COMMON;
  team = "villager";
  activeTime = GameTime.NIGHT;
  isTested = true;
  
  async action(actor, target, eventGame) {
    // Implement your custom role logic
    if (target && !target.isDead) {
      // Do something with the target
      return {
        isSuccess: true,
        result: "Action performed successfully"
      };
    }
    
    return {
      isSuccess: false,
      reason: "Invalid target"
    };
  }
}
```

## 📝 Complete Example

Check out the [example.ts](./example.ts) file for a complete working example that demonstrates:
- Setting up a game
- Handling all major events
- Implementing AI players with random actions
- Managing the full game lifecycle

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Fahmi Ilham**

## 🙏 Acknowledgments

- Inspired by the classic Werewolf/Mafia party game
- Built for developers who want to create their own Werewolf game experiences

---

**Note**: This library handles game logic only. You'll need to implement your own UI, networking, and player communication layer.