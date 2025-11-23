"use client";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { GraphSettingType, Edge } from "@/types/graph";
import { make_edge } from "@/lib/generateGraph";
import * as React from "react";
import { Checkbox } from "@/ui/checkbox";

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
    const draft = React.useRef<GraphSettingType>({...graphSetting});
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    return (
        <div className="fixed inset-0 w-full h-full flex justify-center items-center">
            <Card className="w-96 flex flex-col justify-center items-center gap-y-4 p-8 max-h-[80vh] max-w-[80vw]">
                <h1 className="text-xl font-bold">Graph Setting</h1>
                <form className="w-full" autoComplete="off" onSubmit={(e) => {
                        e.preventDefault();
                        if(textAreaRef.current) {
                            const res = toGraph(textAreaRef.current.value, draft.current.DirectedGraph);
                            const graphEdges: Edge[] = Array.from(res.map.values()).map(({ u, v, w }) => make_edge(u, v, w));
                            if(res.nodes.size<=30 && res.nodes.has(draft.current.START_NODE) && res.nodes.has(draft.current.TARGET_NODE)){
                                setGraphEdges(graphEdges);
                                setGraphSetting({...draft.current });
                                setShowGraphSet(false);
                            }
                        }
                }}>
                    <div className="w-full space-y-3">
                        <Checkbox title={"Directed Graph"} onCheckedChange={(v) => draft.current.DirectedGraph = Boolean(v)}/>
                        <Slider min={200} max={2000} step={300} defaultValue={[graphSetting.SPEED]} onValueChange={(ar) => draft.current.SPEED = ar[0]} title={"Speed (ms)"}/>
                        <div className="h-auto w-auto">
                            <label htmlFor="startNode" className="text-sm">Start Node: </label>
                            <input onChange={(e) => draft.current.START_NODE = e.target.value} id="startNode" type='text' className="shadow border border-stone-800 rounded-sm w-full"/>
                        </div>
                        <div className="h-auto w-auto">
                            <label htmlFor="endNode" className="text-sm">End Node: </label>
                            <input onChange={(e) => draft.current.TARGET_NODE = e.target.value} id="endNode" type='text' className="shadow border border-stone-800 rounded-sm w-full"/>
                        </div>
                        <label htmlFor="inputGraph" className="text-sm">Graph: </label>
                        <p className="text-xs text-stone-400">Input in u v w format. u: fromNode, v: toNode w: weight</p>
                        <textarea 
                        id="inputGraph" 
                        ref={textAreaRef} 
                        className="block w-full min-h-20 shadow max-h-72 border border-b-stone-800 rounded-md" 
                        defaultValue={"1 2 3\n2 3 4"}/>
                    </div>
                    <Button variant={"primary"} size={"lg"} type="submit" className="w-full mt-4">Apply</Button>
                </form>
                <p className="text-xs text-stone-400">Note: There must be no more than 30 unique nodes. Make sure start and end nodes are correct.</p>
            </Card>
        </div>
    );
}