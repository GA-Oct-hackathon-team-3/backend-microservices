export declare function GenericBackoff(func: () => Promise<any>, backoff?: number, max_backoff?: number, msg?: string): Promise<void>;
export declare function GenericBackoffWithMaxRetry(func: () => Promise<any>, backoff?: number, retries?: number, msg?: string): Promise<void>;
