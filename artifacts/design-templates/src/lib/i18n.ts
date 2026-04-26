export const translations = {
  he: {
    nav_home: "ראשי",
    nav_services: "שירותים",
    nav_gallery: "גלריה",
    nav_order: "הזמנה",
    nav_contact: "צור קשר",
    nav_help: "מדריכים",
    hero_badge: "סטודיו לעיצוב דיגיטלי",
    hero_slogan: "עיצוב ווידאו לאירועים — במהירות של תבנית, ברמה של סטודיו",
    cta_gallery: "צפו בדוגמאות",
    cta_order: "הזמינו עכשיו",
    promise_title: "ההבטחה שלנו אליכם",
    promise_hours: "סקיצה ראשונה תוך",
    promise_hours_suffix: "שעות",
    filter_all: "הכל",
    search_placeholder: "חיפוש...",
    customize: "התאמה אישית",
    download: "הורדה",
    share_wa: "שיתוף בוואטסאפ",
    share_copy: "העתק קישור",
    chat_title: "שירות לקוחות הדר",
    chat_greeting: "שלום! אני כאן לעזור. איך אוכל לסייע?",
  },
  en: {
    nav_home: "Home",
    nav_services: "Services",
    nav_gallery: "Gallery",
    nav_order: "Order",
    nav_contact: "Contact",
    nav_help: "Guides",
    hero_badge: "Digital Design Studio",
    hero_slogan: "Event Design & Video — Template Speed, Studio Quality",
    cta_gallery: "View Gallery",
    cta_order: "Order Now",
    promise_title: "Our Promise to You",
    promise_hours: "First draft within",
    promise_hours_suffix: "Hours",
    filter_all: "All",
    search_placeholder: "Search...",
    customize: "Customize",
    download: "Download",
    share_wa: "Share on WhatsApp",
    share_copy: "Copy Link",
    chat_title: "Hadar Customer Service",
    chat_greeting: "Hello! I am here to help. How can I assist you?",
  }
};

export type TranslationKey = keyof typeof translations.he;

export function t(key: TranslationKey, lang: "he" | "en") {
  return translations[lang][key];
}
