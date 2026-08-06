import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

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
  
  // Stats
  'stat_providers': { en: 'Verified Providers', ur: 'تصدیق شدہ فراہم کنندگان' },
  'stat_emergency': { en: 'Emergency Support', ur: 'ایمرجنسی سپورٹ' },
  'stat_customers': { en: 'Happy Customers', ur: 'خوش صارفین' },
  'stat_categories': { en: 'Service Categories', ur: 'خدمات کے زمرے' },

  // Testimonials
  'testimonials_title': { en: 'What Our Customers Say', ur: 'ہمارے صارفین کیا کہتے ہیں' },
  'testimonials_subtitle': { en: 'Trusted by thousands of homeowners and businesses across Pakistan', ur: 'پاکستان بھر میں ہزاروں گھر مالکان اور کاروباری اداروں کا اعتماد' },
  'testimonial_1_name': { en: 'Ahmed Khan', ur: 'احمد خان' },
  'testimonial_1_role': { en: 'Homeowner', ur: 'گھر مالک' },
  'testimonial_1_quote': { en: 'Found an excellent electrician within minutes. Professional service and fair pricing. Highly recommended!', ur: 'منٹوں میں ایک بہترین الیکٹریشن مل گیا۔ پیشہ ورانہ خدمت اور مناسب قیمت۔' },
  'testimonial_2_name': { en: 'Fatima Ali', ur: 'فاطمہ علی' },
  'testimonial_2_role': { en: 'Business Owner', ur: 'کاروبار مالک' },
  'testimonial_2_quote': { en: 'Skill Serve has been a game-changer for our office maintenance. Quick response and verified professionals every time.', ur: 'سکل سرو نے ہمارے دفتر کی دیکھ بھال کو آسان بنا دیا۔ ہر بار فوری جواب اور تصدیق شدہ پیشہ ور۔' },
  'testimonial_3_name': { en: 'Hassan Raza', ur: 'حسن رضا' },
  'testimonial_3_role': { en: 'Property Manager', ur: 'پراپرٹی مینیجر' },
  'testimonial_3_quote': { en: 'Managing multiple properties is so much easier now. The emergency service feature has saved us many times.', ur: 'اب کئی جائیدادوں کا انتظام بہت آسان ہو گیا ہے۔ ایمرجنسی سروس نے کئی بار ہماری مدد کی۔' },
  'testimonial_4_name': { en: 'Ayesha Malik', ur: 'عائشہ ملک' },
  'testimonial_4_role': { en: 'Homeowner', ur: 'گھر مالک' },
  'testimonial_4_quote': { en: 'The plumber arrived in under 30 minutes for our emergency. Excellent platform with reliable service providers!', ur: 'پلمبر ہماری ایمرجنسی کے لیے 30 منٹ سے بھی کم وقت میں پہنچ گیا۔ بہترین پلیٹ فارم!' },
  'testimonial_5_name': { en: 'Usman Sheikh', ur: 'عثمان شیخ' },
  'testimonial_5_role': { en: 'Restaurant Owner', ur: 'ریسٹورنٹ مالک' },
  'testimonial_5_quote': { en: 'We use Skill Serve for all our HVAC and cleaning needs. Consistent quality and transparent pricing.', ur: 'ہم اپنی تمام ایچ وی اے سی اور صفائی کی ضروریات کے لیے سکل سرو استعمال کرتے ہیں۔' },

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

  // Favorites
  'favorites': { en: 'Favorites', ur: 'پسندیدہ' },
  'no_favorites': { en: 'No favorites yet', ur: 'ابھی کوئی پسندیدہ نہیں' },
  'no_favorites_desc': { en: 'Tap the heart on any provider to save them here.', ur: 'کسی بھی فراہم کنندہ پر دل دبائیں تاکہ وہ یہاں محفوظ ہو جائے۔' },
  'browse_providers': { en: 'Browse Providers', ur: 'فراہم کنندگان دیکھیں' },
  'saved': { en: 'Saved', ur: 'محفوظ کر لیا' },
  'removed': { en: 'Removed', ur: 'ہٹا دیا گیا' },

  // Packages
  'service_packages': { en: 'Service Packages', ur: 'سروس پیکیجز' },
  'packages_desc': { en: 'Offer fixed-price bundles to attract more bookings', ur: 'زیادہ بکنگ کے لیے مقررہ قیمت والے پیکیج پیش کریں' },
  'no_packages': { en: 'No packages offered yet.', ur: 'ابھی کوئی پیکیج پیش نہیں کیا گیا۔' },
  'no_packages_own': { en: 'No packages yet. Add your first above.', ur: 'ابھی کوئی پیکیج نہیں۔ اوپر سے پہلا شامل کریں۔' },
  'add_package': { en: 'Add Package', ur: 'پیکیج شامل کریں' },
  'title': { en: 'Title', ur: 'عنوان' },
  'description': { en: 'Description', ur: 'تفصیل' },
  'duration_minutes': { en: 'Duration (minutes)', ur: 'دورانیہ (منٹ)' },
  'minutes_short': { en: 'min', ur: 'منٹ' },

  // Portfolio
  'portfolio': { en: 'Portfolio', ur: 'پورٹ فولیو' },
  'portfolio_desc': { en: 'Show off your past work', ur: 'اپنا پچھلا کام دکھائیں' },
  'no_portfolio': { en: 'No portfolio photos yet.', ur: 'ابھی کوئی تصویر نہیں۔' },
  'add_photo': { en: 'Add Photo', ur: 'تصویر شامل کریں' },
  'uploading': { en: 'Uploading…', ur: 'اپ لوڈ ہو رہا ہے…' },
  'limit_reached': { en: 'Limit reached', ur: 'حد پوری ہو گئی' },

  // Provider detail
  'back': { en: 'Back', ur: 'واپس' },
  'book': { en: 'Book', ur: 'بک کریں' },
  'call': { en: 'Call', ur: 'کال' },
  'message': { en: 'Message', ur: 'پیغام' },
  'reviews': { en: 'Reviews', ur: 'جائزے' },
  'no_reviews': { en: 'No reviews yet.', ur: 'ابھی کوئی جائزہ نہیں۔' },
  'provider_not_found': { en: 'Provider not found.', ur: 'فراہم کنندہ نہیں ملا۔' },
  'verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  'insured': { en: 'Insured', ur: 'بیمہ شدہ' },
  'new_provider': { en: 'New', ur: 'نیا' },

  // Common actions
  'loading': { en: 'Loading…', ur: 'لوڈ ہو رہا ہے…' },
  'delete': { en: 'Delete', ur: 'حذف کریں' },
  'cancel': { en: 'Cancel', ur: 'منسوخ' },
  'save': { en: 'Save', ur: 'محفوظ کریں' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingLang = useRef<Language | null>(null);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    pendingLang.current = lang;
    setIsTransitioning(true);
    // After fade-out completes, swap language then fade back in
    setTimeout(() => {
      setLanguageState(lang);
      pendingLang.current = null;
      // Small delay to let DOM update with new dir before fading in
      requestAnimationFrame(() => setIsTransitioning(false));
    }, 300);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div
        className={language === 'ur' ? 'font-urdu leading-loose' : ''}
        dir={language === 'ur' ? 'rtl' : 'ltr'}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: isTransitioning ? 0 : 1,
        }}
      >
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
