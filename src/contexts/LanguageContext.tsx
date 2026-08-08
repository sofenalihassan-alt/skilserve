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

  // Phase 4 — chat images
  'attach_photo': { en: 'Attach photo', ur: 'تصویر منسلک کریں' },
  'attached_photo': { en: 'Attached photo', ur: 'منسلک تصویر' },
  'remove_photo': { en: 'Remove photo', ur: 'تصویر ہٹائیں' },
  'chat_photo': { en: 'Chat photo', ur: 'چیٹ تصویر' },
  'invalid_image': { en: 'Unsupported file', ur: 'غیر معاون فائل' },
  'invalid_image_desc': { en: 'Only JPG, PNG and WebP images are allowed.', ur: 'صرف JPG، PNG اور WebP تصاویر کی اجازت ہے۔' },
  'image_too_large': { en: 'Image too large', ur: 'تصویر بہت بڑی ہے' },
  'image_too_large_desc': { en: 'Each image must be 5MB or smaller.', ur: 'ہر تصویر 5MB یا اس سے کم ہونی چاہیے۔' },
  'too_many_images': { en: 'Too many images', ur: 'بہت زیادہ تصاویر' },
  'too_many_images_desc': { en: 'You can send up to 3 images per message.', ur: 'آپ ہر پیغام میں زیادہ سے زیادہ 3 تصاویر بھیج سکتے ہیں۔' },
  'photo': { en: 'Photo', ur: 'تصویر' },
  'close': { en: 'Close', ur: 'بند کریں' },
  'previous': { en: 'Previous', ur: 'پچھلا' },
  'next': { en: 'Next', ur: 'اگلا' },

  // Phase 4 — referrals
  'referrals': { en: 'Invite & Earn', ur: 'دعوت دیں اور کمائیں' },
  'referrals_desc': { en: 'Share your code and earn points when friends complete their first booking.', ur: 'اپنا کوڈ شیئر کریں اور دوستوں کی پہلی بکنگ مکمل ہونے پر پوائنٹس کمائیں۔' },
  'your_points': { en: 'Your points', ur: 'آپ کے پوائنٹس' },
  'people_invited': { en: 'People invited', ur: 'مدعو افراد' },
  'rewarded_referrals': { en: 'Rewarded', ur: 'انعام یافتہ' },
  'your_referral_code': { en: 'Your referral code', ur: 'آپ کا ریفرل کوڈ' },
  'copy_link': { en: 'Copy link', ur: 'لنک کاپی کریں' },
  'share': { en: 'Share', ur: 'شیئر کریں' },
  'copied': { en: 'Copied', ur: 'کاپی ہو گیا' },
  'referral_link_copied': { en: 'Invite link copied to clipboard.', ur: 'دعوتی لنک کلپ بورڈ پر کاپی ہو گیا۔' },
  'copy_failed': { en: 'Could not copy the link.', ur: 'لنک کاپی نہیں ہو سکا۔' },
  'referral_share_text': { en: 'Join me on Skill Serve to find trusted service providers:', ur: 'قابل اعتماد سروس فراہم کنندگان کے لیے سکل سرو پر میرے ساتھ شامل ہوں:' },
  'invited_people': { en: 'Your invites', ur: 'آپ کی دعوتیں' },
  'no_referrals_yet': { en: 'No invites yet. Share your code to get started.', ur: 'ابھی کوئی دعوت نہیں۔ اپنا کوڈ شیئر کریں۔' },
  'rewarded': { en: 'Rewarded', ur: 'انعام مل گیا' },
  'pending_first_booking': { en: 'Awaiting first booking', ur: 'پہلی بکنگ کا انتظار' },
  'referral_rules': { en: 'You earn 100 points and your friend earns 50 points after their first completed booking.', ur: 'دوست کی پہلی مکمل بکنگ پر آپ کو 100 اور انہیں 50 پوائنٹس ملتے ہیں۔' },
  'referral_code_unavailable': { en: 'Referral code unavailable right now.', ur: 'ریفرل کوڈ ابھی دستیاب نہیں۔' },

  // Phase 4 — earnings
  'earnings': { en: 'Earnings & Performance', ur: 'آمدنی اور کارکردگی' },
  'earnings_desc': { en: 'Track your jobs, income and ratings.', ur: 'اپنے کام، آمدنی اور ریٹنگ کا جائزہ لیں۔' },
  'total_earned': { en: 'Total earned', ur: 'کل آمدنی' },
  'this_month': { en: 'This month', ur: 'اس مہینے' },
  'upcoming_earnings': { en: 'Upcoming', ur: 'آنے والی' },
  'jobs_completed': { en: 'Jobs completed', ur: 'مکمل کام' },
  'average_job_value': { en: 'Average job value', ur: 'اوسط کام کی قیمت' },
  'average_rating': { en: 'Average rating', ur: 'اوسط ریٹنگ' },
  'earnings_last_6_months': { en: 'Earnings (last 6 months)', ur: 'آمدنی (گزشتہ 6 ماہ)' },
  'booking_status_mix': { en: 'Booking status mix', ur: 'بکنگ اسٹیٹس' },
  'recent_completed_jobs': { en: 'Recent completed jobs', ur: 'حالیہ مکمل کام' },
  'no_completed_jobs': { en: 'No completed jobs yet.', ur: 'ابھی کوئی مکمل کام نہیں۔' },
  'no_earnings_yet': { en: 'No bookings yet — your earnings will appear here.', ur: 'ابھی کوئی بکنگ نہیں — آپ کی آمدنی یہاں ظاہر ہوگی۔' },
  'service': { en: 'Service', ur: 'خدمت' },
  'date': { en: 'Date', ur: 'تاریخ' },
  'amount': { en: 'Amount', ur: 'رقم' },

  // Phase 4 — saved searches
  'saved_searches': { en: 'Saved searches', ur: 'محفوظ تلاشیں' },
  'no_saved_searches': { en: 'No saved searches yet.', ur: 'ابھی کوئی محفوظ تلاش نہیں۔' },
  'save_this_search': { en: 'Save this search', ur: 'یہ تلاش محفوظ کریں' },
  'save_search_desc': { en: 'Give this filter combination a name so you can reuse it later.', ur: 'اس فلٹر کو ایک نام دیں تاکہ بعد میں دوبارہ استعمال کر سکیں۔' },
  'search_name_placeholder': { en: 'e.g. Cheap electricians nearby', ur: 'مثلاً سستے الیکٹریشن' },
  'search_saved': { en: 'Search saved.', ur: 'تلاش محفوظ ہو گئی۔' },
  'save_search_failed': { en: 'Could not save this search.', ur: 'تلاش محفوظ نہیں ہو سکی۔' },
  'name_required': { en: 'Please enter a name.', ur: 'براہ کرم نام درج کریں۔' },
  'delete_failed': { en: 'Could not delete.', ur: 'حذف نہیں ہو سکا۔' },
  'saved': { en: 'Saved', ur: 'محفوظ' },
  'error': { en: 'Error', ur: 'خرابی' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


const STORAGE_KEY = 'skillserve-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(STORAGE_KEY) === 'ur' ? 'ur' : 'en';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingLang = useRef<Language | null>(null);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    pendingLang.current = lang;
    setIsTransitioning(true);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage failures (private mode)
    }
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
