import {obj} from "steam-session/dist/extra/types";

export async function *StartCountIt<
    OPT extends {start?: number, count?: number} & obj,
    OUT extends any,
>(
    executor: (opt: OPT) => Promise<OUT[]>,
    opts: OPT,
    limit = Infinity
): AsyncGenerator<OUT[]> {
    if(!opts.count) opts.count = 100
    if(!opts.start) opts.start = 0
    while(limit > 0) {
        if((limit -= opts.count) < 0) opts.count += limit
        const results = await executor(opts)
        if(!results.length) break
        yield results
        opts.start += opts.count
    }
}

export async function *StartCountItEvery<
    OPT extends {start?: number, count?: number} & obj,
    OUT extends any,
>(
    executor: (opt: OPT) => Promise<OUT[]>,
    opts: OPT,
    limit = Infinity
): AsyncGenerator<OUT>{
    for await (const el of StartCountIt(executor, opts, limit))
        for(const res of el) yield res
}

export async function consumeIt<T>(generator: AsyncGenerator<T[]>): Promise<T[]> {
    const els = []
    for await (const el of generator)
        els.push(...el)
    return els
}