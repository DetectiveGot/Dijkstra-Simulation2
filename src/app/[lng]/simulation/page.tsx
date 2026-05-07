'use client'

import createLayout from "ngraph.forcelayout"
import createGraph, { Graph, Node as GNode, Link as GLink } from "ngraph.graph";
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { generateRandomGraph } from "@/lib/generateGraph"
import Priority_queue from "@/lib/priority_queue"
import { Edge, Node, NodeData, LinkData, ToEdge, PhysicSettingType, GraphSettingType } from "@/types/graph"
import { getRandom } from "@/lib/generateGraph"
import { PhysicSettings } from "@/components/setting"
import { GraphSetting } from "@/components/graphSetting"
import { Pause, Play, Settings, ChartNetwork, RotateCcw } from "lucide-react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

const NODE_RADIUS = 12;
const PI = Math.PI;
const ARROW_DEG = 30;
const ARROW_LENGTH = 10;
const MAX_SCALE = 3;
const MIN_SCALE = 0.8;
const INF = Infinity;
const SPEED = 500;

const clamp = (val: number, lo: number, hi: number) => {
    return Math.min(Math.max(val, lo), hi);
}

export default function SimulationPage() {
    const graphRef = useRef<Graph<NodeData, LinkData> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const layoutRef = useRef<ReturnType<typeof createLayout>|null>(null);
    const isDragging = useRef<boolean>(false);
    const [showSetting, setShowSetting] = useState(false);
    const [showGraphSet, setShowGraphSet] = useState(false);
    const [graphSetting, setGraphSetting] = useState<GraphSettingType>({START_NODE: "1", TARGET_NODE: "", DirectedGraph: false});

    const [phySetting, setPhysicSetting] = useState<PhysicSettingType>({
        timeStep: 0.5,
        dimensions: 2,
        gravity: -12,
        theta: 0.8,
        springLength: 150,
        springCoefficient: 0.8,
        dragCoefficient: 0.9,
    });

    const [graphEdges, setGraphEdges] = useState<Edge[]|null>(() => generateRandomGraph(5, 4, false));
    const adjList = useRef<Map<string, ToEdge[]>>(new Map());
    const [playing, setPlaying] = useState<boolean>(false);
    const rafRef = useRef<number | null>(null);
    const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pq = useRef(Priority_queue<[number, string]>());
    const curList = useRef<ToEdge[] | null>([]);
    const nodeList = useRef<Map<string, Node>>(new Map());
    const curNode = useRef<[number, string]>([0, graphSetting.START_NODE]);
    const paNodeList = useRef<Map<string, string|null>>(new Map());
    const curNodeBack = useRef<string>(graphSetting.TARGET_NODE);
    const doneTraveseRef = useRef<boolean>(false);
    const doneAllTreverseRef = useRef<boolean>(false);
    const pointerPos = useRef<Map<number, [number, number]>>(new Map());
    const pvEdge = useRef<GLink|null>(null);
    const moveRef = useRef<{
        camera: {
            x: number,
            y: number,
            scale: number
        }, 
        worldPoint: {
            x: number, 
            y: number
        }, 
        dist: number
    }|null>(
        {
            camera: {
                x: 0,
                y: 0,
                scale: 1
            }, 
            worldPoint: {
                x: 0, 
                y: 0
            },
            dist: 0
        }
    );

    const initGraphState = () => {
        if(intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        setPlaying(false);
        pq.current = Priority_queue<[number, string]>();
        curList.current = [];
        nodeList.current = new Map();
        curNode.current = [0, graphSetting.START_NODE];
        pvEdge.current = null;
        doneTraveseRef.current = false;
        doneAllTreverseRef.current = false;
        paNodeList.current = new Map();
        curNodeBack.current = graphSetting.TARGET_NODE;
        const graph = graphRef.current;
        if(graph){
            graph.forEachLink((edge) => {
                edge.data =  {
                    ...edge.data,
                    cur: false,
                    inPath: false,
                    vis: false,
                }
            })

            graph.forEachNode((node) => {
                const u = String(node.id);
                const data = {u: u, 
                    data: {
                        vis: false,
                        dist: INF,
                        cur: false,
                        inPath: false,
                    }}
                nodeList.current.set(u, data);
                paNodeList.current.set(u, null);
            })
        }
    }

    const initGraph = () => {
        graphRef.current = createGraph();
        layoutRef.current = createLayout(graphRef.current, phySetting);
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(!graph || !layout){
            console.warn("initGraph layout or graph is null");
            return;
        }
        initGraphState();
        const canvas = canvasRef.current;
        const canvasSize = canvas?.getBoundingClientRect() ?? {width: 0, height: 0};
        const cWidth = canvasSize.width;
        const cHeight = canvasSize.height;

        adjList.current = new Map();
        if(!graphEdges) return;
        graphEdges.forEach((edge) => {
            graph.addLink(edge.u, edge.v, edge.data);
            const listu = adjList.current.get(edge.u) ?? [];
            listu.push({v: edge.v, data: edge.data});
            adjList.current.set(edge.u, listu);
            if(!graphSetting.DirectedGraph){
                const listv = adjList.current.get(edge.v) ?? [];
                listv.push({v: edge.u, data: edge.data});
                adjList.current.set(edge.v, listv);
            }
        })

        graph.forEachNode((node) => {
            const u = String(node.id);
            const data = {u: u, 
                data: {
                    vis: false,
                    dist: INF,
                    cur: false,
                    inPath: false,
                }}
            nodeList.current.set(u, data);
            layout.setNodePosition(u, clamp(getRandom(0, cWidth-1), 0, cWidth-1), clamp(getRandom(0, cHeight-1), 0, cHeight-1));
        })
    }
    const closestNodeId = useRef<string|null>(null);
    const closestPair = (wPos: [number, number]) => {
        if(!graphRef.current) return null;
        if(!layoutRef.current) return null;
        const layout = layoutRef.current;
        const graph = graphRef.current;
        let minDist = INF;
        let minNodeId = null;
        graph.forEachNode((node) => {
            const nodeId = String(node.id);
            const pos = layout.getNodePosition(nodeId);
            const cal = (wPos[0]-pos.x)*(wPos[0]-pos.x) + (wPos[1]-pos.y)*(wPos[1]-pos.y);
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
    const toWorldCoord = (point: [number, number]) => {
        if(!moveRef.current) return;
        if(!canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const camera = moveRef.current.camera ?? {x: 0, y: 0, scale: 1};
        const x = point[0]-rect.left;
        const y = point[1]-rect.top;
        const wx = (x-camera.x)/camera.scale;
        const wy = (y-camera.y)/camera.scale;
        return [wx, wy];
    }

    const getCenterPoint = (map: Map<number, [number, number]>): [number, number] => {
        let cx = 0;
        let cy = 0;
        const sz = map.size;
        if(sz===0) return [0, 0];
        map.forEach(([x, y]) => {
            cx+=x;
            cy+=y;
        });
        return [cx/sz, cy/sz];
    }

    const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        if(!pointerPos.current) return;
        if(!moveRef.current) return;
        isDragging.current = true;
        pointerPos.current.set(e.pointerId, [e.clientX, e.clientY]);
        e.currentTarget.setPointerCapture(e.pointerId);
        const [cx, cy] = getCenterPoint(pointerPos.current);
        const point = toWorldCoord([cx, cy]);
        if(!point) return;
        const [wx, wy] = point;
        closestNodeId.current = closestPair([wx, wy]);
        moveRef.current = {
            ...moveRef.current,
            worldPoint: {x: wx, y: wy},
        }
        const pointerSize = pointerPos.current.size;
        if(pointerSize>=2) {
            let dist = 0;
            pointerPos.current.forEach(([xx, yy]) => {
                dist += Math.hypot(cx-xx, cy-yy);
            });
            dist/=pointerSize;
            moveRef.current.dist = dist||1;
        }
    }

    const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        if(!isDragging.current) return;
        if(!pointerPos.current) return;
        if(!moveRef.current) return;
        if(!canvasRef.current) return;
        pointerPos.current.set(e.pointerId, [e.clientX, e.clientY]);
        const rect = canvasRef.current.getBoundingClientRect();
        const touchNum = pointerPos.current.size;
        const [cx, cy] = getCenterPoint(pointerPos.current);
        let {camera, worldPoint} = moveRef.current;
        const x = cx-rect.left;
        const y = cy-rect.top;
        if(closestNodeId.current) {
            const wPoint = toWorldCoord([e.clientX, e.clientY]);
            const layout = layoutRef.current;
            const graph = graphRef.current;
            if(wPoint && layout) {
                layout.setNodePosition(closestNodeId.current, wPoint[0], wPoint[1]);
                const node = graph?.getNode(closestNodeId.current);
                if(node) layout.pinNode(node, true);
            }
            return;
        }
        let newScale = camera.scale;
        if(touchNum>=2) {
            let dist = 0;
            pointerPos.current.forEach(([xx, yy]) => {
                dist+=Math.hypot(xx-cx, yy-cy);
            });
            dist/=touchNum;
            if(moveRef.current.dist===0) {
                moveRef.current.dist = dist;
            } else {
                const cal = dist/moveRef.current.dist;
                newScale = clamp(newScale*cal, MIN_SCALE, MAX_SCALE);
                moveRef.current.dist = dist || 1;
            }
        }
        camera = {scale: newScale, x: x-worldPoint.x*newScale, y: y-worldPoint.y*newScale};
        moveRef.current.camera = camera;
    }

    const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        if(!pointerPos.current) return;
        pointerPos.current.delete(e.pointerId);
        if(pointerPos.current.size===0) isDragging.current = false;
        if(!moveRef.current) return;
        const [cx, cy] = getCenterPoint(pointerPos.current);
        const point = toWorldCoord([cx, cy]);
        if(point) moveRef.current.worldPoint = {x: point[0], y: point[1]};
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(!graph || !layout || !closestNodeId.current) return;
        const node = graph?.getNode(closestNodeId.current);
        if(node) layout.pinNode(node, false);
        closestNodeId.current = null;
    }

    const onWheel: React.WheelEventHandler<HTMLCanvasElement> = (e) => {
        if(!canvasRef.current) return;
        if(!moveRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX-rect.left;
        const my = e.clientY-rect.top;
        const wPoint = toWorldCoord([e.clientX, e.clientY]);
        if(!wPoint) return;
        const [wx, wy] = wPoint;
        const camera = moveRef.current.camera;
        let newScale = camera.scale;
        newScale*=Math.exp(-e.deltaY*0.001);
        newScale= clamp(newScale, MIN_SCALE, MAX_SCALE);
        moveRef.current.camera = {x: mx-wx*newScale, y: my-wy*newScale, scale: newScale};
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
        
        const camera = moveRef.current?.camera ?? {x: 0, y: 0, scale: 1};

        ctx.setTransform(dpr * camera.scale, 0, 0, dpr * camera.scale, camera.x * dpr, camera.y * dpr);

        graph.forEachNode((node) => {
            const u = String(node.id);
            node.data = nodeList.current.get(u)?.data ?? {dist: INF, vis: false, inPath: false, cur: false};
        })

        const rotateVector = (x: number, y: number, deg: number) => {
            const nx = x*Math.cos(deg*PI/180)-y*Math.sin(deg*PI/180);
            const ny = x*Math.sin(deg*PI/180)+y*Math.cos(deg*PI/180);
            return {x: nx, y: ny};
        }

        const drawArrow = (edge: GLink, p_from: {x: number, y: number}, p_to: {x: number, y: number}) => {
            if(doneTraveseRef.current && edge.data.inPath) ctx.strokeStyle = "green";
            else if(!doneTraveseRef.current && edge.data.cur) ctx.strokeStyle = "orange";
            else if(edge.data.vis) ctx.strokeStyle = "blue";
            else ctx.strokeStyle = "black"
            if(graphSetting.DirectedGraph){
                const ux = p_to.x-p_from.x;
                const uy = p_to.y-p_from.y;
                const vecSize = Math.hypot(ux, uy);
                if(vecSize===0) return;
                const oneUx = ux/vecSize;
                const oneUy = uy/vecSize;
                const vx = oneUx*ARROW_LENGTH;
                const vy = oneUy*ARROW_LENGTH;
                const V1 = rotateVector(vx, vy, ARROW_DEG);
                const V2 = rotateVector(vx, vy, -ARROW_DEG);
                const P1 = {x: p_to.x-oneUx*NODE_RADIUS, y: p_to.y-oneUy*NODE_RADIUS};
                const P2 = {x: P1.x-V1.x, y: P1.y-V1.y};
                const P3 = {x: P1.x-V2.x, y: P1.y-V2.y};
                ctx.beginPath();
                ctx.moveTo(p_from.x, p_from.y);
                ctx.lineTo(P1.x, P1.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(P1.x, P1.y);
                ctx.lineTo(P2.x, P2.y);
                ctx.lineTo(P3.x, P3.y);
                ctx.closePath();
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(p_from.x, p_from.y);
                ctx.lineTo(p_to.x, p_to.y);
                ctx.stroke();
            }
        }

        graph.forEachLink((edge) => {
            const {fromId, toId} = edge;
            const p_from = layout.getNodePosition(fromId);
            const p_to = layout.getNodePosition(toId);
            drawArrow(edge, p_from, p_to);

            //edge weight label
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(String(edge.data.w), (p_from.x+p_to.x)/2, (p_from.y+p_to.y)/2);
        })

        graph.forEachNode((node) => {
            const nodeId = String(node.id);
            const { x:node_x, y:node_y } = layout.getNodePosition(nodeId);
            //draw circle
            ctx.beginPath();
            ctx.arc(node_x, node_y, NODE_RADIUS, 0, Math.PI*2);
            if(doneTraveseRef.current && node.data.inPath) ctx.strokeStyle = "green";
            else if(!doneTraveseRef.current && node.data.cur) ctx.strokeStyle = "orange";
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
            ctx.fillText(String(node.data.dist), node_x, node_y-NODE_RADIUS-10);
        })
    }

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
    }, [phySetting, graphSetting, graphEdges]);
    
    useEffect(() => {
        if(doneAllTreverseRef.current) return;
        if(playing){
            startSim();
            return () => stopSim();
        } else {
            stopSim();
        }
    }, [playing])

    const updateNode = (fromNode: string, toNode: string, val: number) => {
        if(!nodeList.current) return;
        const nodeData = nodeList.current.get(toNode);
        if(!nodeData) return;
        if(!pq.current){
            console.error("pq is not found");
            return;
        }
        if(!nodeData.data.vis && nodeData.data.dist>val){
            nodeData.data.dist = val;
            pq.current.push([val, toNode]);
            if(paNodeList.current) paNodeList.current.set(toNode, fromNode);
        }
    }

    const updateEdge = (fromNode: string, toNode: string, cur: boolean, inPath: boolean) => {
        const graph = graphRef.current;
        const layout = layoutRef.current;
        if(!graph || !layout) return;
        if(!fromNode || !toNode) return;
        const edge = graph.getLink(fromNode, toNode) || graph.getLink(toNode, fromNode);
        if(!edge) return;
        pvEdge.current = edge;
        edge.data.cur = cur;
        if(inPath) edge.data.inPath = inPath;
        edge.data.vis = true;
    }
    
    const nextOperation = () => {
        if(!curList.current) return;
        if(graphSetting.TARGET_NODE && doneTraveseRef.current) {
            if(!curNodeBack.current) return;
            const parentNode = paNodeList.current.get(curNodeBack.current);
            if(!parentNode) {
                doneAllTreverseRef.current = true;
                stopSim();
                return;
            }
            updateEdge(parentNode, curNodeBack.current, false, true);
            const paData = nodeList.current.get(parentNode);
            if(paData) paData.data.inPath = true;
            curNodeBack.current = parentNode;
            return;
        }

        if(pvEdge.current) pvEdge.current.data.cur = false;
        if(doneTraveseRef.current) return;
        
        const [dist, u] = curNode.current;
        const pv_dt = nodeList.current.get(u);
        if(pv_dt) pv_dt.data.cur = false;
        if(curList.current.length === 0){
            let dt = null;
            let U = null;
            while(!pq.current.empty()){
                const top = pq.current.top();
                pq.current.pop();
                if(top) curNode.current = top;
                else continue;
                dt = nodeList.current.get(curNode.current[1]);
                if(!(dt?.data.vis)) {
                    U = curNode.current[1];
                    break;
                }
            }
            if(!U || U==graphSetting.TARGET_NODE) {
                if(U) {
                    doneTraveseRef.current = true;
                    const uData = nodeList.current.get(U);
                    if(uData) uData.data.inPath = true;
                    curNodeBack.current = U;
                    curList.current = [];
                } else {
                    doneAllTreverseRef.current = true;
                    stopSim();
                }
                return;
            }
            if(dt) {
                dt.data.vis = true;
                dt.data.cur = true;
            }
            curList.current = adjList.current.get(U)?.slice() ?? [];
        } else {
            const to = curList.current[curList.current.length-1];
            updateEdge(u, to.v, true, false);
            curList.current.pop();
            updateNode(u, to.v, dist+(to.data.w ?? 0));
        }
    }

    const startSim = () => {
        if(intervalIdRef.current) return;
        if(!nodeList.current) return;
        if(doneAllTreverseRef.current) return;
        const startPQNode = nodeList.current.get(graphSetting.START_NODE);
        if(startPQNode) {
            if(!startPQNode.data.vis){
                startPQNode.data.dist = 0;
                pq.current.push([0, graphSetting.START_NODE]);
            }
        }
        nextOperation();
        intervalIdRef.current = setInterval(nextOperation, SPEED);
    }

    const stopSim = () => {
        if(!intervalIdRef.current) return;
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null;
    }
    return (
        <main className="h-dvh flex flex-col overflow-hidden">
            <Navbar/>
            <div className="relative flex-1 flex w-full">
                <canvas ref={canvasRef} 
                    style={{touchAction:'none'}} 
                    onContextMenu={(e) => e.preventDefault()}
                    onWheel={onWheel} 
                    onPointerDown={onPointerDown} 
                    onPointerMove={onPointerMove} 
                    onPointerUp={onPointerUp} 
                    className="block w-full flex-1 shadow">
                </canvas>
                <div className="absolute justify-center items-center left-1 top-1.5 flex flex-col bg-white border p-3 rounded-md space-y-1.5">
                    <Button variant={'outline'} size={'icon-lg'} onClick={() => setPlaying(!playing)}>{playing?<Pause className="size-5" aria-hidden/>:<Play className="size-5" aria-hidden="true"/>}</Button>
                    <Button variant={'outline'} size={'icon-lg'} onClick={() => setShowSetting(!showSetting)}><Settings className="size-5" aria-hidden/></Button>
                    <Button variant={'outline'} size={'icon-lg'} onClick={() => setShowGraphSet(!showGraphSet)}><ChartNetwork className="size-5" aria-hidden/></Button>
                    <Button variant={'outline'} size={'icon-lg'} onClick={initGraphState}><RotateCcw className="size-5" aria-hidden/></Button>
                </div>
                {showSetting && <PhysicSettings init={phySetting} onClose={() => setShowSetting(false)}onApply={(next) => { setPhysicSetting(next); setShowSetting(false); }}/>}
                {showGraphSet &&
                    <GraphSetting
                        setGraphSetting={setGraphSetting}
                        setGraphEdges={setGraphEdges}
                        onClose={() => setShowGraphSet(false)}
                    />
                }
            </div>
        </main>
    )
} 