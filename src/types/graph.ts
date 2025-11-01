export type NodeId = string;
export type PQItem = [pq_dist: number, pq_u: NodeId]

export interface Edge {
    u: NodeId;
    v: NodeId;
    data: {
        w: number;
    }
}

export interface ToEdge {
    v: NodeId;
    data: {
        w: number;
    }
}

export interface Node {
    u: NodeId;
    data: {
        vis: boolean;
        dist: number;
    }
}