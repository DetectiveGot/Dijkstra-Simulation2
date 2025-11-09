export type NodeId = string;
export type PQItem = [pq_dist: number, pq_u: NodeId]
export type PhysicSettingType = {
    timeStep: number;
    dimensions: number;
    gravity: number;
    theta: number;
    springLength: number;
    springCoefficient: number;
    dragCoefficient: number;
};

export type GraphSettingType = {
    START_NODE: string,
    TARGET_NODE: string,
    DirectedGraph: boolean,
    SPEED: number
}

export interface Edge {
    u: NodeId;
    v: NodeId;
    data: {
        w: number,
        cur: boolean
        inPath: boolean
    }
}

export interface ToEdge {
    v: NodeId;
    data: {
        w: number,
    }
}

export interface Node {
    u: NodeId;
    data: {
        vis: boolean;
        cur: boolean;
        dist: number;
    }
}

export interface Coord2d {
    x: number,
    y: number,
}