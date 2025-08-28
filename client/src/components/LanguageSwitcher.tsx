import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'language.english', flag: '🇺🇸' },
  { code: 'pidgin', name: 'language.pidgin', flag: '🇳🇬' },
  { code: 'yo', name: 'language.yoruba', flag: '🇳🇬' },
  { code: 'ha', name: 'language.hausa', flag: '🇳🇬' },
  { code: 'ig', name: 'language.igbo', flag: '🇳🇬' },
  { code: 'fr', name: 'language.french', flag: '🇫🇷' },
  { code: 'de', name: 'language.german', flag: '🇩🇪' },
  { code: 'es', name: 'language.spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'language.portuguese', flag: '🇵🇹' },
  { code: 'ar', name: 'language.arabic', flag: '🇸🇦' },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'mobile';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4" />
          <span>{t('language.select_language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex items-center space-x-2 p-2 text-sm rounded-lg transition-colors ${
                i18n.language === language.code
                  ? 'bg-finder-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{language.flag}</span>
              <span className="truncate">{t(language.name)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center space-x-2 text-white hover:bg-white/10 border border-white/20 ${className}`}
          data-testid="language-switcher"
        >
          <Globe className="w-4 h-4" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-xs">{t(currentLanguage.name).split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center justify-between cursor-pointer ${
              i18n.language === language.code ? 'bg-finder-red/10' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{language.flag}</span>
              <span className="font-medium">{t(language.name)}</span>
            </div>
            {i18n.language === language.code && (
              <div className="w-2 h-2 bg-finder-red rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}