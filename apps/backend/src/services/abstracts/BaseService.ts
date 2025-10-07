import { EventEmitter } from "events";

export abstract class BaseService extends EventEmitter {
  protected _isInitialized: boolean = false;
  protected isInitializing: boolean = false;

  constructor(protected serviceName: string) {
    super();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  abstract initialize(): Promise<void>;
}
