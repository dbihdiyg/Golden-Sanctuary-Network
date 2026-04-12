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
  { label: "שאל את רבני הבוגרים", href: "/ask-rabbi" },
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
    title: "עדכוני קהילה",
    description: "חדשות, הודעות, שמחות ופעילות שוטפת.",
    href: "/updates",
    icon: Newspaper,
    image: "/community-gathering.jpg",
  },
  {
    title: "שאל את רבני הבוגרים",
    description: "שאלות בהלכה, אמונה וחיי יום־יום — רבני הקהילה כאן בשבילכם.",
    href: "/ask-rabbi",
    icon: HelpCircle,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop",
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
    title: "סיפורי בוגרים",
    description: "מסעות אישיים של צמיחה, אמונה ושליחות.",
    href: "/stories",
    icon: UserRound,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
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
  {
    id: 1,
    category: "אירועים",
    title: "מפגש בוגרים שנתי 2026",
    date: "י״ז אייר תשפ״ו",
    excerpt: "ערב חיבור חגיגי עם שיעור מרכזי, גלריית זיכרונות, מפגש מחזורים ושולחנות שיח.",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "יוזמות",
    title: "נפתחת תכנית חברותא לבוגרים",
    date: "י׳ אייר תשפ״ו",
    excerpt: "בוגרים ותיקים ילמדו בחברותא עם בוגרים צעירים בנושאי הלכה, אמונה ומוסר — חיזוק הקשר לתורה ולקהילה.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    category: "תורה",
    title: "פתיחת שיעור שבועי — הלכה למעשה לבוגרים",
    date: "ב׳ אייר תשפ״ו",
    excerpt: "שיעורי עיון שבועיים בנושאי יסוד: תפילה, שבת, קדושת הבית ועוד — מפי רבני הקהילה.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 4,
    category: "קהילה",
    title: "איסוף תמונות וסיפורים לארכיון הבוגרים",
    date: "כ״ה ניסן תשפ״ו",
    excerpt: "מזמינים אתכם לשלוח תמונות, סרטונים וסיפורים קצרים שייכנסו לארכיון הדיגיטלי.",
    image: "https://images.unsplash.com/photo-1609770231080-e321deccc34c?q=80&w=1600&auto=format&fit=crop",
  },
];

export const photos = [
  { src: "/rabbi-lelov-shacharit.png", title: "מורנו הרב שליט״א בתפילת שחרית — עיירת לעלוב, פולין", tag: "לעלוב", year: "2026" },
  { src: "/rabbi-lelov-outside.png", title: "מורנו הרב שליט״א בעיירת לעלוב, פולין", tag: "לעלוב", year: "2026" },
  { src: "/photo-meron-shobevim.jpg", title: "אבי תנועת הקירוב הגרי\"ד גרוסמן שליט\"א — תפילה באתרא קדישא מירון לרגל סיום ימי השובבי\"ם", tag: "מירון", year: "2026" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop", title: "ערב תפילה מיוחד בכותל המערבי", tag: "מפגש שנתי", year: "2026" },
  { src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1600&auto=format&fit=crop", title: "רגעים של לימוד וזיכרון", tag: "תורה", year: "2026" },
  { src: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1600&auto=format&fit=crop", title: "ירושלים עיר הקודש", tag: "קהילה", year: "2025" },
  { src: "https://images.unsplash.com/photo-1609770231080-e321deccc34c?q=80&w=1600&auto=format&fit=crop", title: "קריאה בספר התורה", tag: "תורה", year: "2025" },
  { src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1600&auto=format&fit=crop", title: "ספרים עתיקים מאוצרות הישיבה", tag: "אירועים", year: "2024" },
  { src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop", title: "בית המדרש — מקום הלימוד", tag: "מפגש", year: "2024" },
  { src: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1600&auto=format&fit=crop", title: "פרחים לכבוד שבת", tag: "תורה", year: "2024" },
  { src: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1600&auto=format&fit=crop", title: "נרות שבת קודש", tag: "אירועים", year: "2023" },
];

export const videos = [
  { title: "מדוע ללמוד דווקא גמרא? הרב במענה לשאלת הבוגרים", summary: "תשובת מורנו הרב שליט״א לשאלת הבוגרים על חשיבות לימוד הגמרא.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/azdY5mFGjU0/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=azdY5mFGjU0" },
  { title: "שיעור / אירוע מגדל אור", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/_oaNsTAQkWo/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=_oaNsTAQkWo" },
  { title: "שיעור / אירוע מגדל אור", summary: "סרטון חדש שהועלה לספריית הקהילה.", date: "היום", category: "שיעורים", image: "https://img.youtube.com/vi/Cf02bu-432w/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=Cf02bu-432w" },
  { title: "דברי פתיחה למפגש הבוגרים", summary: "מסר קצר על שורשים, אחריות וחיבור מתמשך.", date: "י״ז אייר תשפ״ו", category: "מפגש שנתי", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { title: "סיפורי דרך של בוגרים", summary: "עדויות אישיות על השנים שעיצבו אמונה, מנהיגות וחברות.", date: "י׳ אייר תשפ״ו", category: "סיפורים", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1600&auto=format&fit=crop", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
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
  { title: "שאל את רבני הבוגרים", text: "שאלה בהלכה ואמונה", href: "/ask-rabbi", icon: HelpCircle },
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
