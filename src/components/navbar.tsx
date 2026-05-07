'use client'
import { useT } from 'next-i18next/client';
import { LangDropdown } from '@/components/langDopDown';
import { Link } from '@/components/link';

export default function Navbar() {
    const { t } = useT('components/navbar', { keyPrefix: 'navbar' })
    return (
        <nav className='sticky top-0 w-full h-16 flex justify-between px-6 shadow items-center bg-white shrink-0'>
            <Link href='/'><h1>{t('home')}</h1></Link>
            <div className="flex gap-x-3">
                <LangDropdown/>
            </div>
        </nav>
    )
}