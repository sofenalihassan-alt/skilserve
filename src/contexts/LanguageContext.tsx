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
  'home': { en: 'Home', ur: 'ہوم' },
  'find_services': { en: 'Find Services', ur: 'خدمات تلاش کریں' },
  'emergency': { en: 'Emergency', ur: 'ایمرجنسی' },
  'become_provider': { en: 'Become a Provider', ur: 'فراہم کنندہ بنیں' },
  'account': { en: 'Account', ur: 'اکاؤنٹ' },
  'login': { en: 'Login', ur: 'لاگ ان' },
  'profile': { en: 'Profile', ur: 'پروفائل' },
  'my_bookings': { en: 'My Bookings', ur: 'میری بکنگز' },
  'messages': { en: 'Messages', ur: 'پیغامات' },
  'logout': { en: 'Logout', ur: 'لاگ آؤٹ' },
  
  // Hero
  'hero_title_1': { en: 'Find Trusted Service Providers', ur: 'قابل اعتماد خدمات فراہم کنندگان تلاش کریں' },
  'hero_title_2': { en: 'Near You', ur: 'آپ کے قریب' },
  'hero_subtitle': { en: 'Connect with verified professionals for all your home and business needs. Available 24/7 for emergencies.', ur: 'اپنے گھر اور کاروباری ضروریات کے لیے تصدیق شدہ پیشہ ور افراد سے جڑیں۔ ایمرجنسی کے لیے 24/7 دستیاب۔' },
  'search_placeholder': { en: 'Search for services (plumber, electrician...)', ur: 'خدمات تلاش کریں (پلمبر، الیکٹریشن...)' },
  'location_placeholder': { en: 'Your location', ur: 'آپ کا مقام' },
  
  // Service Categories
  'popular_services': { en: 'Popular Services', ur: 'مقبول خدمات' },
  'providers_count': { en: 'providers', ur: 'فراہم کنندگان' },
  
  // Why Choose
  'why_choose': { en: 'Why Choose Skill Serve?', ur: 'سکل سرو کیوں؟' },
  'verified_providers': { en: 'Verified Providers', ur: 'تصدیق شدہ فراہم کنندگان' },
  'verified_desc': { en: 'All service providers are background checked and verified', ur: 'تمام خدمات فراہم کنندگان کی تصدیق شدہ ہیں' },
  'secure_contact': { en: 'Secure Contact', ur: 'محفوظ رابطہ' },
  'secure_desc': { en: 'Your privacy is protected with our secure messaging system', ur: 'آپ کی رازداری ہمارے محفوظ پیغام رسانی کے نظام سے محفوظ ہے' },
  'quick_response': { en: 'Quick Response', ur: 'فوری جواب' },
  'quick_desc': { en: 'Get connected with nearby providers in seconds', ur: 'سیکنڈوں میں قریبی فراہم کنندگان سے جڑیں' },
  
  // Emergency
  'emergency_services': { en: 'Emergency Services', ur: 'ایمرجنسی خدمات' },
  'emergency_24_7': { en: '24/7 Emergency Services', ur: '24/7 ایمرجنسی خدمات' },
  'emergency_desc': { en: 'Need urgent help? Our verified emergency service providers are available round the clock. Quick response time guaranteed.', ur: 'فوری مدد چاہیے؟ ہمارے تصدیق شدہ ایمرجنسی خدمات فراہم کنندگان چوبیس گھنٹے دستیاب ہیں۔' },
  'view_emergency': { en: 'View Emergency Services', ur: 'ایمرجنسی خدمات دیکھیں' },
  'available_24_7': { en: 'Available 24/7', ur: '24/7 دستیاب' },
  
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
      <div className={language === 'ur' ? 'font-urdu leading-loose' : ''} dir={language === 'ur' ? 'rtl' : 'ltr'}>
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
