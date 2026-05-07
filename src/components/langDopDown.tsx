"use client"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation";
import { Languages } from 'lucide-react';

type Language = 'en'|'th';

const langMap = {
  'en': 'EN - English',
  'th': 'TH - ภาษาไทย'
};

export function LangDropdown() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');
  const lang = (segments[1] || 'en') as Language;

  const handleChangeRoute = (newLang: Language) => {
    if(lang===newLang) return;
    segments[1] = newLang;
    const path = segments.join('/');
    router.push(path.startsWith('/')?path:`/${path}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline"><Languages/> {langMap[lang]}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          {Object.entries(langMap).map(([k, v]) => (
            <DropdownMenuCheckboxItem key={k}
              checked={lang===k}
              onCheckedChange={() => handleChangeRoute(k as Language)}
            >
              {v}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
