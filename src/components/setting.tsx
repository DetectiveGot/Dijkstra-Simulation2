"use client";
import { Card, CardHeader, CardSection } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PhysicSettingType } from "@/types/graph";
import { useState } from "react";
import { toast } from "sonner";

type SettingParams = {
  init: PhysicSettingType,
  onApply: (next: PhysicSettingType) => void,
  onClose: () => void,
}

export const PhysicSettings = ({init, onApply, onClose}:SettingParams) => {
  const [draft, setDraft] = useState<PhysicSettingType>(init);
  const setField = (key: keyof PhysicSettingType) => (arr: number[]) => setDraft((d) => ({ ...d, [key]: arr[0] }));
  return (
      <div 
        className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/50"
        onClick={onClose}
      >
        <Card className="w-96 flex flex-col justify-center items-center gap-y-4 max-h-[80vh] max-w-[80vw] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="flex justify-between w-full">
            <h1>Physics Setting</h1>
            <Button variant={'destructive'} size={'icon-sm'} onClick={onClose}>X</Button>
          </CardHeader>
            <CardSection className="w-full space-y-3">
            <Slider min={-15} max={15} step={1} defaultValue={[init["gravity"]]} onValueChange={setField("gravity")} title={"Gravity"}/>
            <Slider min={50} max={1000} step={50} defaultValue={[init["springLength"]]} onValueChange={setField("springLength")} title={"Spring Length"}/>
            <Slider min={0.1} max={1} step={0.1} defaultValue={[init["springCoefficient"]]} onValueChange={setField("springCoefficient")} title={"Spring Coefficient"}/>
            <Slider min={0.1} max={1} step={0.1} defaultValue={[init["dragCoefficient"]]} onValueChange={setField("dragCoefficient")} title={"Drag Coefficient"}/>
          </CardSection>
          <Button type="submit" className="w-full mt-4" onClick={() => {
            onApply(draft);
            toast.success("Apply successfully!");
          }}>Apply</Button>
        </Card>
      </div>
  );
}