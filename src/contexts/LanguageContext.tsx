import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'skill_serve': { en: 'Skill Serve', ur: 'سکل سرو' },
  'find_services': { en: 'Find Services', ur: 'خدمات تلاش کریں' },
  'emergency': { en: 'Emergency', ur: 'ایمرجنسی' },
  'become_provider': { en: 'Become a Provider', ur: 'فراہم کنندہ بنیں' },
  'account': { en: 'Account', ur: 'اکاؤنٹ' },
  'login': { en: 'Login', ur: 'لاگ ان' },
  'profile': { en: 'Profile', ur: 'پروفائل' },
  'my_bookings': { en: 'My Bookings', ur: 'میری بکنگز' },
  'messages': { en: 'Messages', ur: 'پیغامات' },
  'logout': { en: 'Logout', ur: 'لاگ آؤٹ' },
  
  // Common
  'search': { en: 'Search', ur: 'تلاش کریں' },
  'filter': { en: 'Filter', ur: 'فلٹر' },
  'category': { en: 'Category', ur: 'زمرہ' },
  'location': { en: 'Location', ur: 'مقام' },
  'rating': { en: 'Rating', ur: 'درجہ بندی' },
  'price': { en: 'Price', ur: 'قیمت' },
  'availability': { en: 'Availability', ur: 'دستیابی' },
  
  // Provider
  'providers': { en: 'Service Providers', ur: 'خدمات فراہم کرنے والے' },
  'nearby_providers': { en: 'Nearby Service Providers', ur: 'قریبی خدمات فراہم کنندہ' },
  'hourly_rate': { en: 'Hourly Rate', ur: 'فی گھنٹہ شرح' },
  'experience': { en: 'Experience', ur: 'تجربہ' },
  'years': { en: 'years', ur: 'سال' },
  'contact': { en: 'Contact', ur: 'رابطہ کریں' },
  
  // Emergency
  'emergency_services': { en: 'Emergency Services', ur: 'ایمرجنسی خدمات' },
  'available_24_7': { en: 'Available 24/7', ur: '24/7 دستیاب' },
  
  // Messages
  'all_messages': { en: 'All Messages', ur: 'تمام پیغامات' },
  'no_messages': { en: 'No messages yet', ur: 'ابھی تک کوئی پیغام نہیں' },
  'send_message': { en: 'Send Message', ur: 'پیغام بھیجیں' },
  'type_message': { en: 'Type your message...', ur: 'اپنا پیغام لکھیں...' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'ur' ? 'font-urdu' : ''} dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
