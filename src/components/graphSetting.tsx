"use client";
import { Card, CardHeader, CardSection, CardSectionHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { GraphSettingType, Edge } from "@/types/graph";
import { make_edge } from "@/lib/generateGraph";
import * as React from "react";
import { Checkbox } from "@/ui/checkbox";
import { generateRandomGraph, getRandom } from "@/lib/generateGraph";

const toGraph = (text: string, directedGraph: boolean) => {
    const lines = text.trim().split(/\r?\n/);
    const map = new Map<string, {u: string, v: string, w: number}>();
    const nodes = new Set<string>();
    for (let line of lines) {
        line = line.trim();
        if(!line) continue;
        const data = line.trim().split(/[,\s]+/).slice(0, 3);
        const weight = Number(data[2]);
        if(!data[0] || !data[1] || isNaN(weight)) continue;
        if(!directedGraph) if(data[0]>data[1]) [data[0], data[1]] = [data[1], data[0]];
        const edge = `${data[0]},${data[1]}`;
        const n_data = {u: data[0], v: data[1], w: weight};
        if(map.has(edge)) n_data.w = Math.min(n_data.w, map.get(edge)?.w??Infinity);
        map.set(edge, n_data);
        nodes.add(data[0]);
        nodes.add(data[1]);
    }
    return {map, nodes};
}

export const GraphSetting = ({setShowGraphSet, graphSetting, setGraphSetting, setGraphEdges}:
    {
        setShowGraphSet: React.Dispatch<React.SetStateAction<boolean>>,
        graphSetting: GraphSettingType, 
        setGraphSetting: React.Dispatch<React.SetStateAction<GraphSettingType>>,
        setGraphEdges: React.Dispatch<React.SetStateAction<Edge[]>>
    }) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const [hasTargetNode, setHasTargetNode] = React.useState(Boolean(graphSetting.TARGET_NODE)??false);
    const [rndNodeNum, setRndNodeNum] = React.useState<number>(2);
    const [rndEdgeNum, setRndEdgeNum] = React.useState<number>(1);
    const [graphText, setGraphText] = React.useState<string>("0 1 3\n1 2 4");
    const [startNode, setStartNode] = React.useState<string>(graphSetting.START_NODE??"0");
    const [targetNode, setTargetNode] = React.useState<string>("");
    const [graphSpeed, setGraphSpeed] = React.useState<number>(graphSetting.SPEED??500);
    const [directGraph, setDirectGraph] = React.useState<boolean>(graphSetting.DirectedGraph??false);

    return (
        <div className="fixed inset-0 w-full h-full flex justify-center items-center">
            <Card className="w-96 flex flex-col justify-center items-center gap-y-4 p-8">
                <CardHeader className="text-xl font-bold underline">Graph Setting</CardHeader>
                <CardSection className="w-full">
                    <CardSectionHeader>Setting</CardSectionHeader>
                    <div className="flex flex-wrap gap-3 justify-between">
                        <Checkbox title={"Directed Graph"} checked={directGraph} onCheckedChange={(v) => {
                            setDirectGraph(Boolean(v));
                        }}/>
                        <Checkbox title={"Target Node"} checked={hasTargetNode} onCheckedChange={(v) => {
                            setHasTargetNode(Boolean(v));
                        }}/>
                    </div>
                    <Slider min={200} max={2000} step={300} defaultValue={[graphSetting.SPEED]} onValueChange={(ar) => setGraphSpeed(ar[0])} title={"Speed (ms)"}/>
                </CardSection>
                <CardSection className="w-full">
                    <CardSectionHeader>Random Graph</CardSectionHeader>
                    <div className="space-y-1 flex flex-col justify-center">
                        <div className="h-auto w-auto">
                            <label htmlFor="nodesNum" className="text-sm">Number of nodes (N): </label>
                            <input id="nodesNum" type="number" min={0} max={30} value={rndNodeNum} className="p-1 shadow border border-stone-800 rounded-sm w-full" onChange={(e) => {
                                setRndNodeNum(Number(e.currentTarget.value));
                            }}/>
                        </div>
                        <div className="h-auto w-auto">
                            <label htmlFor="edgesNum" className="text-sm">Number of edges (E; {Math.max(rndNodeNum-1, 0)} &le; E &le; {directGraph?rndNodeNum*(rndNodeNum-1):rndNodeNum*(rndNodeNum-1)/2}): </label>
                            <input id="edgesNum" type="number" min={Math.max(rndNodeNum-1, 0)} max={directGraph?rndNodeNum*(rndNodeNum-1):(rndNodeNum*(rndNodeNum-1))/2} value={rndEdgeNum} className="p-1 shadow border border-stone-800 rounded-sm w-full" onChange={(e) => {
                                setRndEdgeNum(Number(e.currentTarget.value));
                            }}/>
                        </div>
                        <Button variant={"primary"} size={"sm"} onClick={(e) => {
                            e.preventDefault();
                            const N =rndNodeNum;
                            const M = rndEdgeNum
                            const maxEdges = directGraph?N*(N-1):N*(N-1)/2;
                            const minEdges = Math.max(N-1, 0);
                            if(M>maxEdges || M<minEdges) return;
                            const edges = generateRandomGraph(N, M, directGraph);
                            const randomText = edges.map((edge) => `${edge.u} ${edge.v} ${edge.data.w}`).join('\n');
                            setGraphText(randomText);
                            setGraphEdges(edges);
                            setStartNode("0");
                            if(hasTargetNode) setTargetNode(String(getRandom(0, N-1)));
                        }}>Random Graph</Button>
                    </div>
                </CardSection>
                <CardSection className="w-full">
                    <CardSectionHeader>Input Graph</CardSectionHeader>
                    <div className="h-auto w-auto">
                        <label htmlFor="startNode" className="text-sm">Start Node: </label>
                        <input onChange={(e) => setStartNode(e.target.value)} value={startNode} id="startNode" type='text' className="p-1 shadow border border-stone-800 rounded-sm w-full"/>
                    </div>
                    <div className="h-auto w-auto">
                        <label htmlFor="endNode" className="text-sm">End Node: </label>
                        <input onChange={(e) => setTargetNode(e.target.value)} value={targetNode} id="endNode" type='text' className="p-1 shadow border border-stone-800 rounded-sm w-full" disabled={!hasTargetNode}/>
                    </div>
                    <label htmlFor="inputGraph" className="text-sm">Graph: </label>
                    <p className="text-xs text-stone-400">Input in u v w format. u: fromNode, v: toNode w: weight</p>
                    <textarea 
                    id="inputGraph" 
                    ref={textAreaRef}
                    onChange={(e) => setGraphText(e.target.value)}
                    value={graphText}
                    className="block w-full min-h-20 shadow max-h-72 border border-b-stone-800 rounded-md p-1" 
                    />
                </CardSection>
                <CardSection className="w-full">
                    <Button variant={"primary"} size={"sm"} type="submit" className="w-full" onClick={() => {
                        if(textAreaRef.current) {
                            const res = toGraph(graphText, directGraph);
                            const graphEdges: Edge[] = Array.from(res.map.values()).map(({ u, v, w }) => make_edge(u, v, w));
                            if(res.nodes.size<=30 && res.nodes.has(startNode) && (!hasTargetNode || (hasTargetNode && targetNode && res.nodes.has(targetNode)))){
                                setGraphEdges(graphEdges);
                                setGraphSetting({START_NODE: startNode, TARGET_NODE: hasTargetNode?targetNode:"", SPEED: graphSpeed, DirectedGraph: directGraph});
                                setShowGraphSet(false);
                            }
                        }
                    }}>Apply</Button>
                    <p className="text-xs text-stone-400">Note: There must be no more than 30 unique nodes. Make sure start and end nodes are correct.</p>
                </CardSection>
            </Card>
        </div>
    );
}