export class GameEvent<Events extends Record<string, any>> {
	private listeners: {
		[K in keyof Events]?: Array<(payload: Events[K]) => void>;
	} = {};

	on<K extends keyof Events>(
		eventName: K,
		listener: (payload: Events[K]) => void,
	): void {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName]?.push(listener);
	}

	emit<K extends keyof Events>(eventName: K, payload: Events[K]): void {
		this.listeners[eventName]?.forEach((listener) => listener(payload));
	}

	removeAllListeners(): void {
		this.listeners = {};
	}
}
