export default function Priority_queue<T>(){
    let heap: T[] = [];

    const top = () => {
       if(heap.length) return heap[0];
       return null;
    }

    const down = (i: number) => {
        while(true){
            let l = 2*i+1, r = 2*i+2, best = i, n = heap.length;
            if(l<n && heap[l]<heap[best]) best = l;
            if(r<n && heap[r]<heap[best]) best = r;
            if(best==i) break;
            else {
                [heap[i], heap[best]] = [heap[best], heap[i]];
                i = best;
            }
        }
    }

    const up = (i: number) => {
        while(i>0){
            let pa = Math.ceil((i-1)/2);
            if(heap[i]<heap[pa]){
                [heap[i], heap[pa]] = [heap[pa], heap[i]];
                i = pa;
            } else break;
        }
    }

    const push = (val: T) => {
        heap.push(val);
        up(heap.length-1);
    }

    const pop = () => {
        if(!heap.length) return;
        heap[0] = heap[heap.length-1];
        heap.pop();
        if(heap.length) down(0);
    }

    const empty = () => heap.length===0;

    const clear = () => heap = [];

    return {push, pop, top, empty, heap};
}