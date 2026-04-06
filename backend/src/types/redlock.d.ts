declare module 'redlock' {
  import { EventEmitter } from "events";
  
  export interface Settings {
    readonly driftFactor: number;
    readonly retryCount: number;
    readonly retryDelay: number;
    readonly retryJitter: number;
    readonly automaticExtensionThreshold: number;
  }

  export class Lock {
    release(): Promise<unknown>;
    extend(duration: number): Promise<Lock>;
  }

  export default class Redlock extends EventEmitter {
    constructor(clients: Iterable<unknown>, settings?: Partial<Settings>);
    acquire(resources: string[], duration: number, settings?: Partial<Settings>): Promise<Lock>;
    release(lock: Lock, settings?: Partial<Settings>): Promise<unknown>;
    extend(existing: Lock, duration: number, settings?: Partial<Settings>): Promise<Lock>;
  }
}
