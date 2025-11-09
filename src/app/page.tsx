import Image from "next/image";
import { Button } from "@/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full grid grid-rows-[1fr_4rem] px-8 sm:px-20 font-sans">
      <main className="flex flex-col gap-4 justify-center items-center">
        <h1 className='text-3xl'>Dijkstra Simulation</h1>
        <div className="w-full flex flex-col justify-center items-center space-y-1">
          <Link href='/simulation'><Button variant={"primary"} size={"primary"}>Start</Button></Link>
          <Button variant={"primary"} size={"primary"}>Guide</Button>
        </div>
      </main>
    </div>
  );
}
