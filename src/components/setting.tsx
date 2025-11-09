"use client";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { PhysicSetting } from "@/types/graph";
import { useState, useEffect } from "react";

export const GraphSetting = ({init, onApply}:{init: PhysicSetting, onApply: (next: PhysicSetting) => void}) => {
  const [draft, setDraft] = useState<PhysicSetting>(init);
  const setField = (key: keyof PhysicSetting) => (arr: number[]) => setDraft((d) => ({ ...d, [key]: arr[0] }));
  return (
      <div className="fixed inset-0 w-full h-full flex justify-center items-center">
        <Card className="w-96 flex flex-col justify-center items-center gap-y-4 p-6 max-h-[80vh] max-w-[80vw]">
          <h1 className="text-xl font-bold">Physics Setting</h1>
          <form className="w-full" onSubmit={(e) => {
            e.preventDefault();
            onApply(draft);
          }}>
            <div className="w-full space-y-3">
              <Slider min={0.1} max={1} step={0.1} defaultValue={[init["timeStep"]]} onValueChange={setField("timeStep")} title={"Time Step"}/>
              <Slider min={-15} max={15} step={1} defaultValue={[init["gravity"]]} onValueChange={setField("gravity")} title={"Gravity"}/>
              <Slider min={0.1} max={1} step={0.1} defaultValue={[init["theta"]]} onValueChange={setField("theta")} title={"Theta"}/>
              <Slider min={50} max={200} step={10} defaultValue={[init["springLength"]]} onValueChange={setField("springLength")} title={"Spring Length"}/>
              <Slider min={0.1} max={1} step={0.1} defaultValue={[init["springCoefficient"]]} onValueChange={setField("springCoefficient")} title={"Spring Coefficient"}/>
              <Slider min={0.1} max={1} step={0.1} defaultValue={[init["dragCoefficient"]]} onValueChange={setField("dragCoefficient")} title={"Drag Coefficient"}/>
            </div>
            <Button variant={"primary"} size={"lg"} type="submit" className="w-full mt-4">Apply</Button>
          </form>
        </Card>
      </div>
  );
}