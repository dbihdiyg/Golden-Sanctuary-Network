import {
  CalendarDays,
  Camera,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";

export const contact = {
  whatsapp: "https://wa.me/972500000000?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%94%D7%A6%D7%98%D7%A8%D7%A3%20%D7%9C%D7%A2%D7%93%D7%9B%D7%95%D7%A0%D7%99%20%D7%A7%D7%94%D7%99%D7%9C%D7%AA%20%D7%94%D7%91%D7%95%D7%92%D7%A8%D7%99%D7%9D",
  email: "mailto:O462272103@GMAIL.COM",
};

export const navLinks = [
  { label: "בית", href: "/" },
  { label: "פורום", href: "/forum" },
  { label: "תמונות", href: "/photos" },
  { label: "וידאו", href: "/videos" },
  { label: "עלונים", href: "/library" },
  { label: "שאלה לרב", href: "/ask-rabbi" },
  { label: "צור קשר", href: "/contact" },
];

export const categories = [
  {
    title: "תמונות אחרונות",
    description: "גלריות מאירועים, מפגשים ורגעים שלא רוצים לשכוח.",
    href: "/photos",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "ספריית וידאו",
    description: "שיעורים, ברכות, דברי פתיחה וסיפורי בוגרים.",
    href: "/videos",
    icon: Video,
    image: "/rabbi-mic2.jpg",
  },
  {
    title: "עלוני PDF",
    description: "עלונים, סיכומים ופרסומים להורדה מהירה.",
    href: "/library",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop",
  },

  {
    title: "צור קשר",
    description: "וואטסאפ, אימייל וטופס פנייה ישיר לצוות.",
    href: "/contact",
    icon: MessageCircle,
    image: "https://images.unsplash.com/photo-1609770231080-e321deccc34c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "הצטרפות לעדכונים",
    description: "קבלת עלונים, אירועים, תמונות וסרטונים חדשים.",
    href: "/join",
    icon: Send,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "אירועים קרובים",
    description: "מפגשים, שיעורים, ערבי קהילה ויוזמות חדשות.",
    href: "/events",
    icon: CalendarDays,
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop",
  },
];

export const updates = [
  {
    id: 0,
    category: "ברוך דיין האמת",
    title: "יוסף זריהן ז״ל — בוגר ישיבה קטנה מגדל אור, צפת",
    date: "היום",
    excerpt: "בצער רב מבשרת קהילת הבוגרים על פטירתו הפתאומית של הבחור החשוב יוסף זריהן ז״ל מצפת, בוגר ישיבה קטנה מגדל אור, שלא התעורר משנתו. ההלוויה ב-6 בערב. תהא נשמתו צרורה בצרור החיים. בשורות טובות!",
    image: "/yosef-zarihan.jpg",
    mourning: true,
  },
];

export const photos = [
  { src: "/photo-meron-shobevim.jpg", title: "אבי תנועת הקירוב הגרי\"ד גרוסמן שליט\"א — תפילה באתרא קדישא מירון לרגל סיום ימי השובבי\"ם", tag: "מירון", year: "2026" },
];

export const videos = [
  { title: "שיעור / אירוע מגדל אור — חדש 3", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/CaLgv1ZKfeA/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=CaLgv1ZKfeA" },
  { title: "שיעור / אירוע מגדל אור — חדש 2", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/hzMacELExrU/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=hzMacELExrU" },
  { title: "שיעור / אירוע מגדל אור — חדש", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/TPQ-MDNOLu4/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=TPQ-MDNOLu4" },
];

export const pdfs = [
  {
    title: "גליון קצ\"ח – נצור לשונך מרע – תזריע מצורע תשפ\"ו",
    date: "אייר תשפ\"ו",
    description: "פרשת תזריע מצורע: הרמזים שבנגעים, איתות משמיים, מחיר ה'תנועת יד', ותלמיד שפספס את מחיצת רבו.",
    size: "PDF",
    url: "/gliyon-198-tazria-metzora-tashpav.pdf",
  },
  {
    title: "גליון קצ\"ז – התעצמות האמונה – פסח תשפ\"ו",
    date: "ניסן תשפ\"ו",
    description: "ליל התעצמות האמונה: סיפורי דביקות, ניסי ליל הסדר, ועומק 'מאכלא דמהימנותא' — המצה.",
    size: "PDF",
    url: "/gliyon-197-pesach-tashpav.pdf",
  },
  { title: "עלון קהילת הבוגרים", date: "תשרי תשפ״ו", description: "חדשות, דבר תורה, תמונות וסיפורים מהקהילה.", size: "2.4MB", url: null },
  { title: "סיכום מפגש שנתי", date: "אלול תשפ״ה", description: "סיכום מלא של המפגש, תמונות נבחרות ותודות.", size: "1.8MB", url: null },
  { title: "תכנית חונכות בוגרים", date: "אב תשפ״ה", description: "פרטים להצטרפות כמנטור או כבוגר צעיר בתכנית.", size: "1.1MB", url: null },
  { title: "לוח אירועים ועדכונים", date: "תמוז תשפ״ה", description: "אירועים קרובים, שיעורים, מפגשים ויוזמות.", size: "980KB", url: null },
];

export const feed = [
  { date: "היום", title: "נפתחה ההרשמה למפגש החורף", text: "בוגרים מוזמנים להירשם לערב לימוד, שיח וחיבור שיתקיים בבית המדרש המרכזי." },
  { date: "לפני 3 ימים", title: "ברכת מזל טוב לבוגרי המחזור", text: "הקהילה שולחת ברכות חמות לבוגרים שחגגו שמחות משפחתיות בשבוע האחרון." },
  { date: "שבוע שעבר", title: "בקשה לעדכון פרטי קשר", text: "כדי לשמור על קשר רציף, אנא ודאו שכתובת הדוא״ל ומספר הטלפון מעודכנים." },
  { date: "חודש שעבר", title: "יוזמת חסד חדשה יצאה לדרך", text: "קבוצת בוגרים מובילה מערך תמיכה למשפחות בקהילה בתקופות עומס ואתגר." },
];

export const quickActions = [
  { title: "דברו איתנו בוואטסאפ", text: "מענה מהיר לצוות הקהילה", href: contact.whatsapp, icon: MessageCircle },
  { title: "שלחו אימייל", text: "לפניות, תמונות ועדכונים", href: contact.email, icon: Mail },
  { title: "שלחו תמונה או עדכון", text: "נשמח להעלות לאתר", href: "/contact", icon: Camera },
  { title: "הצטרפו לרשימת התפוצה", text: "עלונים, אירועים ומדיה", href: "/join", icon: UsersRound },
];

export const faqs = [
  "כמה זמן לוקח לקבל מענה?",
  "אילו נושאים ניתן לשאול?",
];

export const stories = [
  { title: "מהבית מדרש אל השליחות", text: "בוגר מספר על הדרך שבה השנים במוסד ממשיכות להאיר החלטות יומיומיות.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop" },
  { title: "חברות של עשרים שנה", text: "קשר שהתחיל במחזור אחד והפך לרשת תמיכה משפחתית וקהילתית.", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop" },
  { title: "להישאר מחובר גם מרחוק", text: "איך קהילה דיגיטלית שומרת על נוכחות, תורה וחום גם בין מפגשים.", image: "https://images.unsplash.com/photo-1609770231080-e321deccc34c?q=80&w=1200&auto=format&fit=crop" },
];

export const events = [
  { title: "ערב לימוד לבוגרים", date: "כ״ד סיון תשפ״ו", text: "שיעור מרכזי, שיח מחזורים וכיבוד קל." },
  { title: "מפגש משפחות קיץ", date: "י״ב תמוז תשפ״ו", text: "פעילות קהילתית למשפחות הבוגרים." },
  { title: "שבת בוגרים", date: "אלול תשפ״ו", text: "שבת של חיבור, ניגון, לימוד וזיכרונות." },
];
