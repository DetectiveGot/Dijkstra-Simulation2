import Navbar from "@/components/navbar";
import { getT } from 'next-i18next/server';

export default async function AboutPage() {
    const { t } = await getT('guide-page', {keyPrefix: 'about'});
    return (
        <main className="h-full w-full flex flex-col items-center">
            <Navbar/>
            <main className="p-12 max-w-5xl flex flex-col justify-center gap-y-6 text-xs md:text-base lg:text-lg">
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="font-bold">{t('what_is_this.title')}</h1>
                    <p>{t('what_is_this.description')}</p>
                </section>
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="font-bold">{t('graph_setting.title')}</h1>
                    <p>{t('graph_setting.description_p1')}</p>
                    <p>{t('graph_setting.description_p2')}</p>
                </section>
                <section className="flex flex-col justify-center gap-y-6">
                    <h1 className="font-bold">{t('physics_setting.title')}</h1>
                    <p>{t('physics_setting.gravity')}</p>
                    <p>{t('physics_setting.spring_length')}</p>
                    <p>{t('physics_setting.spring_coefficient')}</p>
                    <p>{t('physics_setting.drag_coefficient')}</p>
                </section>
            </main>
        </main>
    )
}