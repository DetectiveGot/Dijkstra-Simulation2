"use client"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { type ComponentProps } from "react"

export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en';

  const hasLang = href.toString().startsWith(`/${lang}`);
  
  const localizedHref = hasLang?href:`/${lang}${href.toString().startsWith('/') ? href : `/${href}`}`;

  return <NextLink href={localizedHref} {...props} />;
}