import en from './en.json';
import fr from './fr.json';

const translations: Record<string, any> = {
  en,
  fr
};
 
export function t(lang: string, key: string): string {
    
    if (!(lang in translations)) {
        console.warn(`Language '${lang}' not found, defaulting to 'en'...`);
        lang = 'en'; // Fallback to English if the language is not found
    }

    if (!(key in translations[lang])) {
        console.warn(`Translation key '${key}' not found for language '${lang}', returning the key...`);
        return key; // Fallback to the key if the translation is not found
    }
    
    return translations[lang][key] || key; // Fallback sur la clé si non trouvée
   
}