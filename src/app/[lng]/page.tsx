import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getT } from 'next-i18next/server';
import Navbar from "@/components/navbar";

export default async function Home() {
  const { t } = await getT('main-page', { keyPrefix: 'buttons' });
  return (
    <main className="min-h-dvh min-w-dvw flex flex-col">
      <Navbar/>
      <div className="flex-1 flex flex-col justify-center items-center gap-y-4">
        <h1 className='text-3xl'>Dijkstra Simulation</h1>
        <div className="flex flex-col items-center gap-y-1">
          <Link href='/simulation'><Button className="px-8">{t('play')}</Button></Link>
          <Link href='/guide'><Button className="px-8">{t('guide')}</Button></Link>
        </div>
      </div>
    </main>
  );
}
