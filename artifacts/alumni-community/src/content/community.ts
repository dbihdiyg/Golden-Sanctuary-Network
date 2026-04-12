import {
  CalendarDays,
  Camera,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Newspaper,
  Send,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";

export const contact = {
  whatsapp: "https://wa.me/972500000000?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%94%D7%A6%D7%98%D7%A8%D7%A3%20%D7%9C%D7%A2%D7%93%D7%9B%D7%95%D7%A0%D7%99%20%D7%A7%D7%94%D7%99%D7%9C%D7%AA%20%D7%94%D7%91%D7%95%D7%92%D7%A8%D7%99%D7%9D",
  email: "mailto:alumni@example.org",
};

export const navLinks = [
  { label: "בית", href: "/" },
  { label: "תמונות", href: "/photos" },
  { label: "וידאו", href: "/videos" },
  { label: "עלונים", href: "/library" },
  { label: "עדכונים", href: "/updates" },
  { label: "שאל את הרב", href: "/ask-rabbi" },
  { label: "צור קשר", href: "/contact" },
];

export const categories = [
  {
    title: "תמונות אחרונות",
    description: "גלריות מאירועים, מפגשים ורגעים שלא רוצים לשכוח.",
    href: "/photos",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "ספריית וידאו",
    description: "שיעורים, ברכות, דברי פתיחה וסיפורי בוגרים.",
    href: "/videos",
    icon: Video,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "עלוני PDF",
    description: "עלונים, סיכומים ופרסומים להורדה מהירה.",
    href: "/library",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "עדכוני קהילה",
    description: "חדשות, הודעות, שמחות ופעילות שוטפת.",
    href: "/updates",
    icon: Newspaper,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "שאל את הרב",
    description: "שליחת שאלות בצורה מכבדת, אישית ודיסקרטית.",
    href: "/ask-rabbi",
    icon: HelpCircle,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "צור קשר",
    description: "וואטסאפ, אימייל וטופס פנייה ישיר לצוות.",
    href: "/contact",
    icon: MessageCircle,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "הצטרפות לעדכונים",
    description: "קבלת עלונים, אירועים, תמונות וסרטונים חדשים.",
    href: "/join",
    icon: Send,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "סיפורי בוגרים",
    description: "מסעות אישיים של צמיחה, אמונה ושליחות.",
    href: "/stories",
    icon: UserRound,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "אירועים קרובים",
    description: "מפגשים, שיעורים, ערבי קהילה ויוזמות חדשות.",
    href: "/events",
    icon: CalendarDays,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop",
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
  {
    id: 1,
    category: "אירועים",
    title: "מפגש בוגרים שנתי 2026",
    date: "י״ז אייר תשפ״ו",
    excerpt: "ערב חיבור חגיגי עם שיעור מרכזי, גלריית זיכרונות, מפגש מחזורים ושולחנות שיח.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "יוזמות",
    title: "נפתח מיזם החונכות לבוגרים צעירים",
    date: "י׳ אייר תשפ״ו",
    excerpt: "בוגרים ותיקים מלווים את הדור החדש בצמתים של לימודים, משפחה, עבודה ושליחות.",
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    category: "תורה",
    title: "סדרת שיעורים חדשה בנושא מנהיגות",
    date: "ב׳ אייר תשפ״ו",
    excerpt: "לימוד עומק על אחריות, אמונה ומנהיגות בחיי היום־יום של הבוגר.",
    image: "https://images.unsplash.com/photo-1507676184212-d0c30a5991c0?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 4,
    category: "קהילה",
    title: "איסוף תמונות וסיפורים לארכיון הבוגרים",
    date: "כ״ה ניסן תשפ״ו",
    excerpt: "מזמינים אתכם לשלוח תמונות, סרטונים וסיפורים קצרים שייכנסו לארכיון הדיגיטלי.",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1600&auto=format&fit=crop",
  },
];

export const photos = [
  { src: "/photo-meron-shobevim.jpg", title: "אבי תנועת הקירוב הגרי\"ד גרוסמן שליט\"א — תפילה באתרא קדישא מירון לרגל סיום ימי השובבי\"ם", tag: "מירון", year: "2026" },
  { src: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1600&auto=format&fit=crop", title: "ערב איחוד בבית המדרש", tag: "מפגש שנתי", year: "2026" },
  { src: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1600&auto=format&fit=crop", title: "רגעים של לימוד וזיכרון", tag: "תורה", year: "2026" },
  { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop", title: "מפגש דורות בחצר", tag: "קהילה", year: "2025" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop", title: "חברות שנמשכת שנים", tag: "מחזורים", year: "2025" },
  { src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1600&auto=format&fit=crop", title: "שמחת הקהילה", tag: "אירועים", year: "2024" },
  { src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop", title: "שולחנות של זיכרונות", tag: "מפגש", year: "2024" },
  { src: "https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?q=80&w=1600&auto=format&fit=crop", title: "שיחה אחרי שיעור", tag: "תורה", year: "2024" },
  { src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop", title: "ערב קהילה חגיגי", tag: "אירועים", year: "2023" },
];

export const videos = [
  { title: "שיעור / אירוע מגדל אור", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/Cf02bu-432w/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=Cf02bu-432w" },
  { title: "דברי פתיחה למפגש הבוגרים", summary: "מסר קצר על שורשים, אחריות וחיבור מתמשך.", date: "י״ז אייר תשפ״ו", category: "מפגש שנתי", image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1600&auto=format&fit=crop", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { title: "סיפורי דרך של בוגרים", summary: "עדויות אישיות על השנים שעיצבו אמונה, מנהיגות וחברות.", date: "י׳ אייר תשפ״ו", category: "סיפורים", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600&auto=format&fit=crop", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { title: "שיעור מיוחד: להיות מאיר בעולם", summary: "שיעור מעורר השראה על שליחות של בוגר בתוך חיי המעשה.", date: "ב׳ אייר תשפ״ו", category: "שיעורים", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
];

export const pdfs = [
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
  { title: "שאל את הרב", text: "שאלה אישית או אנונימית", href: "/ask-rabbi", icon: HelpCircle },
  { title: "שלחו תמונה או עדכון", text: "נשמח להעלות לאתר", href: "/contact", icon: Camera },
  { title: "הצטרפו לרשימת התפוצה", text: "עלונים, אירועים ומדיה", href: "/join", icon: UsersRound },
];

export const faqs = [
  "האם אפשר לשלוח שאלה באופן אנונימי?",
  "כמה זמן לוקח לקבל מענה?",
  "האם שאלות מתפרסמות באתר?",
];

export const stories = [
  { title: "מהבית מדרש אל השליחות", text: "בוגר מספר על הדרך שבה השנים במוסד ממשיכות להאיר החלטות יומיומיות.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop" },
  { title: "חברות של עשרים שנה", text: "קשר שהתחיל במחזור אחד והפך לרשת תמיכה משפחתית וקהילתית.", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop" },
  { title: "להישאר מחובר גם מרחוק", text: "איך קהילה דיגיטלית שומרת על נוכחות, תורה וחום גם בין מפגשים.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" },
];

export const events = [
  { title: "ערב לימוד לבוגרים", date: "כ״ד סיון תשפ״ו", text: "שיעור מרכזי, שיח מחזורים וכיבוד קל." },
  { title: "מפגש משפחות קיץ", date: "י״ב תמוז תשפ״ו", text: "פעילות קהילתית למשפחות הבוגרים." },
  { title: "שבת בוגרים", date: "אלול תשפ״ו", text: "שבת של חיבור, ניגון, לימוד וזיכרונות." },
];