import Priority_queue from "./priority_queue";
import { Edge, Node } from "@/types/graph";

export const getRandom = (l: number, r: number) => {
    return l + Math.floor(Math.random()*(r-l+1));
}

export const make_edge = (u: string, v: string, w: number) => {
    const res = {
        u: String(u),
        v: String(v),
        data: {
            w: w,
            cur: false,
            inPath: false,
        }
    }
    return res;
}

export const generateRandomGraph = (N: number, M: number): Edge[] => {
    let prufer: number[] = [];
    let result: Edge[] = [];
    let deg: number[] = new Array<number>(N).fill(1);
    for(let i=0;i<N-2;i++){
        prufer.push(getRandom(0, N-1));
        deg[prufer[i]]++;
    }
    const pq = Priority_queue<number>();
    const mp = new Set<string>();
    for(let i=0;i<N;i++) if(deg[i]==1) pq.push(i);
    prufer.forEach((node) => {
        let u = pq.top()!;
        let v = node;
        pq.pop();
        deg[v]--;
        if(deg[v]==1) pq.push(v);
        if(u>v) [u, v] = [v, u];
        result.push(make_edge(String(u), String(v), getRandom(1, 1000)));
        mp.add(`${u},${v}`);
    })
    let u = pq.top()!; pq.pop();
    let v = pq.top()!; pq.pop();
    result.push(make_edge(String(u), String(v), getRandom(1, 1000)));
    if(u<v) mp.add(`${u},${v}`);
    else mp.add(`${v},${u}`);

    M = Math.min(N*(N-1)/2, M);
    let it = 0;
    while(result.length<M && it<=1000){
        u = getRandom(0, N-2);
        v = getRandom(u+1, N-1);
        ++it;
        if(mp.has(`${u},${v}`)) continue;
        result.push(make_edge(String(u), String(v), getRandom(1, 1000)));
        mp.add(`${u},${v}`);
    }
    // console.log(result);
    
    return result;
}