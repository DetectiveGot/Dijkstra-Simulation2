'use client'

import createLayout from "ngraph.forcelayout"
import createGraph from "ngraph.graph"
import { useEffect, useRef, useState } from "react"
import type React from "react"

type NodeId = string;

interface Edge {
    u: NodeId;
    v: NodeId;
    w?: number;
}

const NODE_RADIUS = 12;
const MAX_SCALE = 3;
const MIN_SCALE = 0.8;
const DRAG_DEL_X = 50;
const DRAG_DEL_Y = 50;

const clamp = (val: number, lo: number, hi: number) => {
    return Math.min(Math.max(val, lo), hi);
}

export default function SimulationPage() {
    const graphRef = useRef<ReturnType<typeof createGraph>|null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const layoutRef = useRef<ReturnType<typeof createLayout>|null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [camera, setCamera] = useState({x: 0, y: 0, scale: 1});
    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});

    const [phySetting, setPhysicSetting] = useState({
        timeStep: 0.5,
        dimensions: 2,
        gravity: -12,
        theta: 0.8,
        springLength: 80,
        springCoefficient: 0.8,
        dragCoefficient: 0.9,
    });

    const [graphEdges, setGraphEdges] = useState<Edge[]>([{u:"1", v:"2"}]);

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

        graphEdges.forEach((edge) => {
            graph.addLink(edge.u, edge.v);
        })

        return () => {
            
        }
    }
    const [lastPos, setLastPos] = useState({x: 0, y: 0});
    const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
    }

    const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setCamera((p) => ({ ...p, x: p.x + dx, y: p.y + dy}));
        setLastPos({ x: e.clientX, y: e.clientY });
    }

    const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const onWheel: React.WheelEventHandler<HTMLElement> = (e) => {
        const dy = e.deltaY;
        // if(dy<0) setCamera((p) => ({...p, scale: clamp(p.scale*1.1, MIN_SCALE, MAX_SCALE)}));
        // else if(dy>0) setCamera((p) => ({...p, scale: clamp(p.scale*0.9, MIN_SCALE, MAX_SCALE)}));
        if(!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX-rect.left;
        const my = e.clientY-rect.top;
        setCamera((p) => {
            const wx = (mx-p.x)/p.scale;
            const wy = (my-p.y)/p.scale;
            let newScale = p.scale;
            if(dy<0) newScale = p.scale*1.1;
            else newScale = p.scale*0.9;
            newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
            return {x: mx-wx*newScale, y: my-wy*newScale, scale: newScale};
        });
    }

    const draw = () => {
        const graph = graphRef.current;
        const layout = layoutRef.current;
        const canvas = canvasRef.current;
        if(!canvas || !graph || !layout) {
            if(!canvas) console.error("canvas is not found");
            if(!layout) console.error("layout is not found");
            if(!graph) console.error("graph is not found");
            return;
        }
        layout.step();
        const ctx = canvas.getContext("2d")!;

        //resize canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width*dpr;
        canvas.height = rect.height*dpr;
        setCanvasSize({width: canvas.width, height: canvas.height});

        // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.setTransform(dpr * camera.scale, 0, 0, dpr * camera.scale, camera.x * dpr, camera.y * dpr);

        graph.forEachLink((edge) => {
            const edgeId = edge.id;
            const {fromId, toId} = edge;
            const p_from = layout.getNodePosition(fromId);
            const p_to = layout.getNodePosition(toId);
            ctx.beginPath();
            ctx.moveTo(p_from.x, p_from.y);
            ctx.lineTo(p_to.x, p_to.y);
            ctx.stroke();
        })

        graph.forEachNode((node) => {
            const nodeId = node.id;
            const { x:node_x, y:node_y } = layout.getNodePosition(nodeId);
            // console.log(node_x, node_y);
            //draw circle
            ctx.beginPath();
            ctx.arc(node_x, node_y, NODE_RADIUS, 0, Math.PI*2);
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.stroke();
            //draw text id
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(nodeId, node_x, node_y);
        })
    }
    useEffect(() => {
        initGraph();
        draw();
    }, []);
    useEffect(() => {
        draw();
    }, [camera]);
    return (
        <>
            <canvas ref={canvasRef} 
            style={{touchAction:'none'}} 
            onContextMenu={(e) => e.preventDefault()}
            onWheel={onWheel} 
            onPointerDown={onPointerDown} 
            onPointerMove={onPointerMove} 
            onPointerUp={onPointerUp} 
            className="w-full h-full shadow"></canvas>
        </>
    )
} 