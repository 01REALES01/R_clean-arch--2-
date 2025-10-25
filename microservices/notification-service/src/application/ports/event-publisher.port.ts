// Port for event publishing (interface for infrastructure)
export interface EventPublisher {
  publish(pattern: string, data: any): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');
