export async function GenericBackoff(func: () => Promise<any>, backoff = 2000, max_backoff = 60000, msg?: string) {
    try {
        await func();
    } catch (error) {
        if (msg) {
            console.log(msg, `... Retrying in ${backoff}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, backoff));
        return GenericBackoff(func, Math.min(max_backoff, backoff * 2), max_backoff, msg);
    }
}

export async function GenericBackoffWithMaxRetry(func: () => Promise<any>, backoff = 2000, retries = 10, msg?: string) {
    try {
        await func();
    } catch (e) {
        if (retries <= 0) {
            throw new Error("Reached max retries");
        }
        if (msg) {
            console.log(msg, `... Retrying in ${backoff}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, backoff));
        return GenericBackoffWithMaxRetry(func, backoff * 2, retries - 1, msg);
    }
}