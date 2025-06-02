import EventEmitter from 'events';

export abstract class BaseService {
  protected _isInitialized: boolean = false;
  protected _events: EventEmitter = new EventEmitter();
  
  constructor(private _serviceName: string) {}
  
  get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  get serviceName(): string {
    return this._serviceName;
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    this._events.on(event, listener);
    return this;
  }

  public once(event: string, listener: (...args: any[]) => void): this {
    this._events.once(event, listener);
    return this;
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this._events.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    if (event) {
      this._events.removeAllListeners(event);
    } else {
      this._events.removeAllListeners();  
    }
    return this;
  }

  public emit(event: string, ...args: any[]): this {
    this._events.emit(event, ...args);
    return this;
  }

  async initialize(): Promise<this> {
    this._isInitialized = true;
    return this;
  }

  async destroy(): Promise<void> {
    this._isInitialized = false;
  }

  protected throwIfNotInitialized(): void {
    if (!this._isInitialized) {
      throw new Error(`Service ${this.serviceName} not initialized`);
    }
  }
} 