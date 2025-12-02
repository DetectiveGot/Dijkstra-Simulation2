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
    u: string;
    v: string;
    data: {
        w: number,
        cur: boolean
        inPath: boolean
    }
}

export interface ToEdge {
    v: string;
    data: {
        w: number,
    }
}

export interface Node {
    u: string;
    data: {
        vis: boolean;
        cur: boolean;
        inPath: boolean;
        dist: number;
    }
}

export interface NodeData {
    vis: boolean;
    cur: boolean;
    inPath: boolean;
    dist: number;
}

export type LinkData = {
    w: number;
    cur?: boolean;
    inPath?: boolean;
    vis?: boolean
};