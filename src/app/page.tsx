import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh min-w-dvw h-full w-full flex flex-col gap-4 justify-center items-center">
      <h1 className='text-3xl'>Dijkstra Simulation</h1>
      <div className="w-full flex flex-col justify-center items-center space-y-1">
        <Link href='/simulation'><Button>Start</Button></Link>
        <Link href='/guide'><Button>Guide</Button></Link>
      </div>
    </main>
  );
}
