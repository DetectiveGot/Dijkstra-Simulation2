import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getT } from 'next-i18next/server';

export default async function Home() {
  const { t } = await getT('main-page', { keyPrefix: 'buttons' });
  return (
    <main className="min-h-dvh min-w-dvw h-full w-full flex flex-col gap-4 justify-center items-center">
      <h1 className='text-3xl'>Dijkstra Simulation</h1>
      <div className="w-full flex flex-col justify-center items-center space-y-1">
        <Link href='/simulation'><Button>{t('play')}</Button></Link>
        <Link href='/guide'><Button>{t('guide')}</Button></Link>
      </div>
    </main>
  );
}
