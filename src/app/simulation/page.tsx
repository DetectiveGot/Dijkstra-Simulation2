'use client'

import createLayout from "ngraph.forcelayout"
import createGraph from "ngraph.graph"
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { Button } from "@/ui/button"
import { generateRandomGraph } from "@/lib/generateGraph"
import Priority_queue from "@/lib/priority_queue"
import { Edge, NodeId, Node, ToEdge, PQItem, Coord2d } from "@/types/graph"
import { getRandom } from "@/lib/generateGraph"
import { GraphSetting } from "@/components/setting"

const NODE_RADIUS = 12;
const MAX_SCALE = 3;
const MIN_SCALE = 0.8;
const DRAG_DEL_X = 50;
const DRAG_DEL_Y = 50;
const INF = Infinity;
const SPEED = 500;
const START_NODE = "1";
const TARGET_NODE = "4";

const clamp = (val: number, lo: number, hi: number) => {
    return Math.min(Math.max(val, lo), hi);
}

export default function SimulationPage() {
    const graphRef = useRef<ReturnType<typeof createGraph>|null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const layoutRef = useRef<ReturnType<typeof createLayout>|null>(null);
    const isDragging = useRef<boolean>(false);
    const camera = useRef({x: 0, y: 0, scale: 1})

    const [phySetting, setPhysicSetting] = useState({
        timeStep: 0.5,
        dimensions: 2,
        gravity: -12,
        theta: 0.8,
        springLength: 150,
        springCoefficient: 0.8,
        dragCoefficient: 0.9,
    });

    const [graphEdges, setGraphEdges] = useState<Edge[]>(() => generateRandomGraph(5, 4));
    const adjList = useRef<Map<string, ToEdge[]>>(new Map());
    const [playing, setPlaying] = useState<boolean>(false);

    const initGraph = () => {
        graphRef.current = createGraph();
        layoutRef.current = createLayout(graphRef.current, phySetting);
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(!graph || !layout){
            console.warn("initGraph layout or graph is null");
            return;
        }
        const canvas = canvasRef.current;
        const canvasSize = canvas?.getBoundingClientRect() ?? {width: 0, height: 0};
        const cWidth = canvasSize.width;
        const cHeight = canvasSize.height;

        graphEdges.forEach((edge) => {
            graph.addLink(edge.u, edge.v, edge.data);
            const listu = adjList.current.get(edge.u) ?? [];
            const listv = adjList.current.get(edge.v) ?? [];
            listu.push({v: edge.v, data: edge.data});
            listv.push({v: edge.u, data: edge.data});
            adjList.current.set(edge.u, listu);
            adjList.current.set(edge.v, listv);
        })

        graph.forEachNode((node) => {
            const u = String(node.id);
            const data = {u: u, 
                data: {
                    vis: false,
                    dist: Infinity,
                    cur: false
                }}
            nodeList.current.set(u, data);
            layout.setNodePosition(u, clamp(getRandom(0, cWidth-1), 0, cWidth-1), clamp(getRandom(0, cHeight-1), 0, cHeight-1));
        })
    }
    const lastPos = useRef<Coord2d|null>({x: 0, y: 0});
    const closestNodeId = useRef<NodeId|null>(null);

    const toWorldCoord = (pos: Coord2d): (Coord2d|null) => {
        if(!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = pos.x-rect.left;
        const my = pos.y-rect.top;
        const wx = (mx-camera.current.x)/camera.current.scale;
        const wy = (my-camera.current.y)/camera.current.scale;
        return {x: wx, y: wy}
    }

    const closestPair = (wPos: Coord2d) => {
        if(!graphRef.current) return null;
        if(!layoutRef.current) return null;
        const layout = layoutRef.current;
        const graph = graphRef.current;
        let minDist = Infinity;
        let minNodeId = null;
        graph.forEachNode((node) => {
            const nodeId = String(node.id);
            const pos = layout.getNodePosition(nodeId);
            const cal = (wPos.x-pos.x)*(wPos.x-pos.x) + (wPos.y-pos.y)*(wPos.y-pos.y);
            if(cal<=NODE_RADIUS*NODE_RADIUS && cal<minDist){
                minDist = cal;
                minNodeId = node.id;
            }
        })
        return minNodeId;
    }
    //left 1
    //right 2
    //mid 4
    const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        isDragging.current = true;
        const isMouse = e.pointerType === "mouse";
        if(!isMouse || (isMouse && !!(e.buttons&1))){
            const wPos = toWorldCoord({x: e.clientX, y: e.clientY});
            if(wPos) closestNodeId.current = closestPair(wPos);
        }
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    }

    const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        if (!isDragging.current) return;
        if(!lastPos.current) return;
        const isMouse = e.pointerType === "mouse";
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        if((!isMouse && !closestNodeId.current) || (isMouse && !!(e.buttons&2))){
            camera.current = { ...camera.current, x: camera.current.x + dx, y: camera.current.y + dy}
        }
        if(!isMouse || (isMouse && !!(e.buttons&1))) {
            if(closestNodeId.current && layoutRef.current && graphRef.current) {
                const layout = layoutRef.current;
                const graph = graphRef.current;
                const wpos = toWorldCoord({x: e.clientX, y: e.clientY});
                if(wpos) {
                    layout.pinNode(graph.getNode(closestNodeId.current)!, true);
                    layout.setNodePosition(closestNodeId.current, wpos.x, wpos.y)
                }
            }
        }
        
        lastPos.current = { x: e.clientX, y: e.clientY };
    }

    const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(graph && layout && closestNodeId.current){
            layout.pinNode(graph.getNode(closestNodeId.current)!, false);
            closestNodeId.current = null;
        }
    }

    const onWheel: React.WheelEventHandler<HTMLCanvasElement> = (e) => {
        const dy = e.deltaY;
        if(!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX-rect.left;
        const my = e.clientY-rect.top;
        const wx = (mx-camera.current.x)/camera.current.scale;
        const wy = (my-camera.current.y)/camera.current.scale;
        let newScale = camera.current.scale;
        if(dy<0) newScale = camera.current.scale*1.1;
        else newScale = camera.current.scale*0.9;
        newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
        camera.current = {x: mx-wx*newScale, y: my-wy*newScale, scale: newScale};
    }

    const draw = () => {
        const graph = graphRef.current;
        const layout = layoutRef.current;
        const canvas = canvasRef.current;
        if(!canvas || !graph || !layout) return;
        const ctx = canvas.getContext("2d")!;

        //resize canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width*dpr;
        canvas.height = rect.height*dpr;

        ctx.setTransform(dpr * camera.current.scale, 0, 0, dpr * camera.current.scale, camera.current.x * dpr, camera.current.y * dpr);

        graph.forEachNode((node) => {
            const u = String(node.id);
            node.data = nodeList.current.get(u)?.data ?? {dist: Infinity, vis: false, cur: false};
        })

        graph.forEachLink((edge) => {
            const edgeId = edge.id;
            const {fromId, toId} = edge;
            const p_from = layout.getNodePosition(fromId);
            const p_to = layout.getNodePosition(toId);
            //draw linear line edge
            ctx.beginPath();
            ctx.moveTo(p_from.x, p_from.y);
            ctx.lineTo(p_to.x, p_to.y);
            if(edge.data.cur) ctx.strokeStyle = "orange";
            else if(edge.data.inPath) ctx.strokeStyle = "green";
            else ctx.strokeStyle = "black"
            ctx.stroke();

            //edge weight label
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(edge.data.w, (p_from.x+p_to.x)/2, (p_from.y+p_to.y)/2);
        })

        graph.forEachNode((node) => {
            const nodeId = String(node.id);
            const { x:node_x, y:node_y } = layout.getNodePosition(nodeId);
            //draw circle
            ctx.beginPath();
            ctx.arc(node_x, node_y, NODE_RADIUS, 0, Math.PI*2);
            if(node.data.cur) ctx.strokeStyle = "orange";
            else if(node.data.vis) ctx.strokeStyle = "blue";
            else ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.stroke();
            //label text id
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(nodeId, node_x, node_y);
            //label distance from start node
            ctx.fillText(node.data.dist, node_x, node_y-NODE_RADIUS-10);
        })
    }

    const rafRef = useRef<number | null>(null);
    const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopAll = () => {
        if(intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        if(rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }
    
    useEffect(() => {
        initGraph();
        let running = true;
        const frame = () => {
            if(!running) return;
            layoutRef.current?.step();
            draw();
            rafRef.current = requestAnimationFrame(frame);
        }
        rafRef.current = requestAnimationFrame(frame);
        return () => {
            running = false;
            stopAll();
        }
    }, []);
    const pq = useRef(Priority_queue<PQItem>());
    const curList = useRef<ToEdge[] | null>([]);
    const nodeList = useRef<Map<string, Node>>(new Map());
    const curNode = useRef<PQItem>([0, START_NODE]);
    useEffect(() => {
        if(playing){
            startSim();
            return () => stopSim();
        } else {
            stopSim();
        }
    }, [playing])

    const updateNode = (node: string, val: number) => {
        if(!nodeList.current) return;
        const nodeData = nodeList.current.get(node);
        if(!nodeData) return;
        if(!pq.current){
            console.error("pq is not found");
            return;
        }
        if(!nodeData.data.vis && nodeData.data.dist>val){
            nodeData.data.dist = val;
            pq.current.push([val, node]);
        }
    }

    const updateEdge = (fromNode: string, toNode: string, cur: boolean, inPath: boolean) => {
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(!graph || !layout) return;
        if(!fromNode || !toNode) return;
        const edge = graph.getLink(fromNode, toNode) || graph.getLink(toNode, fromNode);
        if(!edge) return;
        edge.data.cur = cur;
        edge.data.inPath = inPath;
    }

    const pvEdge = useRef<[string, string]|null>(null);

    const nextOperation = () => {
        if(!curList.current) return;
        const [dist, u] = curNode.current;
        if(pvEdge.current){
            updateEdge(pvEdge.current[0], pvEdge.current[1], false, false);
            pvEdge.current = null;
        }
        const pv_dt = nodeList.current.get(u);
        if(pv_dt) pv_dt.data.cur = false;
        if(curList.current.length === 0){
            let dt = null;
            let U = null;
            while(!pq.current.empty()){
                curNode.current = pq.current.top()!;
                pq.current.pop();
                dt = nodeList.current.get(curNode.current[1]);
                if(!(dt?.data.vis)) {
                    U = curNode.current[1];
                    break;
                }
            }
            if(!U) return;
            if(dt) {
                dt.data.vis = true;
                dt.data.cur = true;
            }
            curList.current = adjList.current.get(U)?.slice() ?? [];
        } else {
            const to = curList.current[curList.current.length-1];
            updateEdge(u, to.v, true, false);
            pvEdge.current = [u, to.v];
            curList.current.pop();
            updateNode(to.v, dist+(to.data.w ?? 0));
        }
    }

    const startSim = () => {
        if(intervalIdRef.current) return;
        if(!nodeList.current) return;
        const startPQNode = nodeList.current.get(START_NODE);
        if(startPQNode) {
            if(!startPQNode.data.vis){
                startPQNode.data.dist = 0;
                pq.current.push([0, START_NODE]);
            }
        }
        nextOperation();
        intervalIdRef.current = setInterval(nextOperation, SPEED)
    }

    const stopSim = () => {
        if(!intervalIdRef.current) return;
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null;
    }
    return (
        <div className="relative h-full flex">
            <canvas ref={canvasRef} 
            style={{touchAction:'none'}} 
            onContextMenu={(e) => e.preventDefault()}
            onWheel={onWheel} 
            onPointerDown={onPointerDown} 
            onPointerMove={onPointerMove} 
            onPointerUp={onPointerUp} 
            className="w-full h-full shadow"></canvas>
            <div className="absolute justify-center items-center left-1 top-3 flex flex-col bg-slate-50 shadow p-3 rounded-md space-y-1.5">
                <Button onClick={(e) => setPlaying(!playing)}>{playing?"Stop":"Play"}</Button>
                <Button>Setting</Button>
                <Button>Graph</Button>
            </div>
            {/* <GraphSetting/> */}
        </div>
    )
} 