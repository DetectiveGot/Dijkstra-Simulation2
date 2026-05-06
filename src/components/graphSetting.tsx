"use client";
import { Card, CardHeader, CardSection, CardSectionHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphSettingType, Edge } from "@/types/graph";
import { make_edge } from "@/lib/generateGraph";
import React, {useState} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { generateRandomGraph } from "@/lib/generateGraph";
import { toast } from "sonner";

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

type SettingParams = {
    setGraphSetting: React.Dispatch<React.SetStateAction<GraphSettingType>>,
    setGraphEdges: React.Dispatch<React.SetStateAction<Edge[]|null>>
    onClose: () => void,
}

type RandomSetting = {
    nodeCount: number|null, 
    edgeCount: number|null,
};

const MAX_NODES = 20;
const MAX_EDGES = 40;

export const GraphSetting = ({
        setGraphSetting, 
        setGraphEdges,
        onClose
    }:SettingParams) => {
    const [hasEndNode, setHasEndNode] = useState(false); 
    const [textGraph, setTextGraph] = useState("");
    const [randomSetting, setRandomSetting] = useState<RandomSetting>({nodeCount: null, edgeCount: null});
    const [isDirect, setDirect] = useState(false);

    const handleApply = (formData:FormData) => {
        const isDirect = Boolean(formData.get("directGraph")) ?? false;
        const startNode = String(formData.get("startNode")) ?? null;
        const newGraphSetting = {
            START_NODE: startNode,
            TARGET_NODE: String(formData.get("endNode")) ?? null,
            DirectedGraph: isDirect
        }
        const rawEdges = String(formData.get("rawEdges"));
        const {map, nodes} = toGraph(rawEdges, isDirect);
        if(nodes.size>MAX_NODES || nodes.size<2) {
            toast.error(`Allow number of nodes range is 2 to ${MAX_NODES}`, {
                description: "This node doesn't exists in your graph",
            });
            return;
        }
        if(!startNode || !nodes.has(startNode)) {
            toast.error("Invalid Start Node", {
                description: "This node doesn't exists in your graph",
            });
            return;
        }
        const edgeArr = map.values().toArray();
        if(edgeArr.length>MAX_EDGES || edgeArr.length<2) {
            toast.error(`Allow number of nodes range is ${(randomSetting.nodeCount||1)-1} to ${MAX_EDGES}`, {
                description: "This node doesn't exists in your graph",
            });
            return;
        }
        setGraphEdges(edgeArr.map((v) => make_edge(v.u, v.v, v.w)));
        map.values().toArray().map((v) => make_edge(v.u, v.v, v.w))
        setGraphSetting(newGraphSetting);
        toast.success("Apply successfully");
        onClose();
    }

    const handleRandomInput = () => {
        if(!randomSetting.nodeCount || !randomSetting.edgeCount) return;
        const {nodeCount, edgeCount} = randomSetting;
        const edgeData = generateRandomGraph(nodeCount, edgeCount, isDirect);
        if(!edgeData) {
            toast.error(`Generate random took too long to process`, {
                description: "Try something smaller",
            });
            return;
        }
        const edgeText = edgeData.map(({u, v, data: {w}}) => `${u} ${v} ${w}`).join('\n');
        setTextGraph(edgeText);
        toast.success("Generate random edges successfully");
    }

    return (
        <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/50"
            onClick={(e) => onClose()}
        >
            <form onClick={(e) => {
                    e.stopPropagation()
                }}
                action={handleApply}    
            >
                <Card className="w-96 flex flex-col justify-center items-center gap-y-4 p-8">
                    <CardHeader className="flex justify-between w-full">
                        <h1>Generate Graph</h1>
                        <Button variant={'destructive'} size={'icon-sm'} onClick={onClose} type='button'>X</Button>
                    </CardHeader>
                    <CardSection className="w-full">
                        <div className="flex flex-wrap gap-3 justify-between">
                            <Checkbox title={"Directed Graph"} name='directGraph'
                                checked={isDirect}
                                onCheckedChange={(v) => setDirect(v===true)}
                            />
                            <Checkbox title={"End Node"} checked={hasEndNode} onCheckedChange={(val) => setHasEndNode(val===true)}/>
                        </div>
                    </CardSection>
                    <CardSection className="w-full">
                        <CardSectionHeader>Generate Random Connected Graph Input</CardSectionHeader>
                        <div className="space-y-1 flex flex-col justify-center">
                            <div className="h-auto w-auto">
                                <label htmlFor="nodesNum" className="text-sm">Number of nodes (2-{MAX_NODES}):</label>
                                <input id="nodesNum" name='nodeCount' type="number" min={2} max={MAX_NODES} className="p-1 border rounded-sm w-full"
                                    onChange={(e) => setRandomSetting((val) => ({...val, nodeCount: Number(e.target.value)}))}
                                />
                            </div>
                            <div className="h-auto w-auto">
                                <label htmlFor="edgesNum" className="text-sm">Number of edges ({Math.min(MAX_EDGES, (randomSetting.nodeCount||1)-1)}-{MAX_EDGES}):</label>
                                <input id="edgesNum" name='edgeCount' type="number" min={Math.min(MAX_EDGES, (randomSetting.nodeCount||1)-1)} max={MAX_EDGES} className="p-1 border rounded-sm w-full"
                                    onChange={(e) => setRandomSetting((val) => ({...val, edgeCount: Number(e.target.value)}))}
                                />
                            </div>
                            <Button type='button' onClick={handleRandomInput}>Random Input</Button>
                        </div>
                    </CardSection>
                    <CardSection className="w-full">
                        <CardSectionHeader>Input Graph</CardSectionHeader>
                        <div className="h-auto w-auto">
                            <label htmlFor="startNode" className="text-sm">Start Node:</label>
                            <input placeholder={'1'} name='startNode' id="startNode" type='text' className="p-1 border rounded-sm w-full" required/>
                        </div>
                        {hasEndNode && <div className="h-auto w-auto">
                            <label htmlFor="endNode" className="text-sm">End Node:</label>
                            <input placeholder={'End Node (Optional)'} name='endNode' id="endNode" type='text' className="p-1 border rounded-sm w-full"/>
                        </div>}
                        <label htmlFor="inputGraph" className="text-sm">Graph:</label>
                        <p className="text-xs text-stone-400">Input in u v w format. u: fromNode, v: toNode w: weight</p>
                        <textarea id="inputGraph" value={textGraph} onChange={(e) => setTextGraph(e.currentTarget.value)} name='rawEdges' className="w-full border rounded-sm"/>
                    </CardSection>
                    <CardSection className="w-full">
                        <Button type="submit" className="w-full">Apply</Button>
                    </CardSection>
                </Card>
            </form>
        </div>
    );
}