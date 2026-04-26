import weddingImg from "../assets/images/wedding.png";
import barMitzvahImg from "../assets/images/bar-mitzvah.png";
import torahClassImg from "../assets/images/torah-class.png";
import charityImg from "../assets/images/charity.png";
import videoImg from "../assets/images/video.png";

export interface TextSlot {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  multiline?: boolean;
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fontFamily?: "serif" | "sans";
  bold?: boolean;
  italic?: boolean;
  color?: "gold" | "white" | "dark" | "cream" | "inherit";
  // Absolute positioning (in % of image dimensions) — for custom Photoshop templates
  x?: number;       // % from left edge
  y?: number;       // % from top edge
  width?: number;   // % width of the text box
  align?: "center" | "right" | "left";
  lineHeight?: number; // multiplier e.g. 1.2
}

export interface Template {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  style: string;
  price: number;
  image: string;
  isGradient?: boolean;
  slots?: TextSlot[];
}

export const categories = [
  "הזמנות לקידוש",
  "הזמנות לחתונה",
  "מודעות לאירועים",
  "מודעות לישיבות",
  "תבניות וידאו",
  "עיצובים לחגים"
];

export const styles = [
  "יוקרתי",
  "חסידי",
  "מודרני",
  "קלאסי",
  "זהב",
  "מינימליסטי"
];

const weddingSlots: TextSlot[] = [
  { id: "top_verse", label: "פסוק / ברכה פותחת", placeholder: "בס\"ד", defaultValue: "בס\"ד", fontSize: "sm", fontFamily: "serif", color: "gold" },
  { id: "groom_title", label: "כינוי החתן", placeholder: "החתן", defaultValue: "החתן", fontSize: "sm", color: "gold" },
  { id: "groom_name", label: "שם החתן", placeholder: "אברהם בן יצחק", defaultValue: "אברהם בן יצחק", fontSize: "xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "bride_title", label: "כינוי הכלה", placeholder: "והכלה", defaultValue: "והכלה", fontSize: "sm", color: "gold" },
  { id: "bride_name", label: "שם הכלה", placeholder: "שרה בת משה", defaultValue: "שרה בת משה", fontSize: "xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "invitation_text", label: "טקסט הזמנה", placeholder: "מזמינים אתכם לשמוח עמנו...", defaultValue: "מזמינים אתכם לשמוח עמנו\nבשמחת נישואינו", multiline: true, fontSize: "sm" },
  { id: "date_heb", label: "תאריך עברי", placeholder: "ב׳ אדר תשפ״ו", defaultValue: "ב׳ אדר תשפ״ו", fontSize: "md", fontFamily: "serif", bold: true },
  { id: "date_civil", label: "תאריך לועזי", placeholder: "יום שלישי כ״ב במרץ 2026", defaultValue: "יום שלישי, כ״ב במרץ 2026", fontSize: "sm" },
  { id: "time", label: "שעה", placeholder: "בשעה שבע בערב", defaultValue: "בשעה שבע בערב", fontSize: "sm" },
  { id: "hall", label: "אולם / מיקום", placeholder: "אולם המלך דוד, ירושלים", defaultValue: "אולם המלך דוד, ירושלים", fontSize: "sm", bold: true },
  { id: "groom_parents", label: "הורי החתן", placeholder: "ישראל ורחל כהן", defaultValue: "ישראל ורחל כהן", fontSize: "xs" },
  { id: "bride_parents", label: "הורי הכלה", placeholder: "יצחק ושרה לוי", defaultValue: "יצחק ושרה לוי", fontSize: "xs" },
];

const kiddushSlots: TextSlot[] = [
  { id: "top_verse", label: "ברכה פותחת", placeholder: "בס\"ד", defaultValue: "בס\"ד", fontSize: "sm", fontFamily: "serif", color: "gold" },
  { id: "occasion", label: "סיבת האירוע", placeholder: "בשמחת הברית", defaultValue: "בשמחת הברית", fontSize: "xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "baby_name", label: "שם הרך הנולד / בעל השמחה", placeholder: "פנחס יוסף", defaultValue: "פנחס יוסף", fontSize: "2xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "invitation_text", label: "טקסט הזמנה", placeholder: "יש לנו את הכבוד להזמינכם...", defaultValue: "יש לנו את הכבוד להזמינכם\nלסעודת מצווה", multiline: true, fontSize: "sm" },
  { id: "date_heb", label: "תאריך עברי", placeholder: "יום שישי פרשת בשלח", defaultValue: "יום שישי פרשת בשלח", fontSize: "md", fontFamily: "serif", bold: true },
  { id: "date_civil", label: "תאריך לועזי", placeholder: "ז׳ בפברואר 2026", defaultValue: "ז׳ בפברואר 2026", fontSize: "sm" },
  { id: "time", label: "שעה", placeholder: "אחרי תפילת שחרית", defaultValue: "אחרי תפילת שחרית", fontSize: "sm" },
  { id: "location", label: "מיקום", placeholder: "בית הכנסת...", defaultValue: "בית כנסת אוהל שרה, אלעד", fontSize: "sm", bold: true },
  { id: "host_name", label: "שם המשפחה", placeholder: "משפחת ישראלי", defaultValue: "משפחת ישראלי", fontSize: "sm" },
];

const eventSlots: TextSlot[] = [
  { id: "top_verse", label: "כותרת עליונה", placeholder: "בס\"ד", defaultValue: "בס\"ד", fontSize: "sm", fontFamily: "serif", color: "gold" },
  { id: "main_title", label: "כותרת ראשית", placeholder: "ערב עיון מיוחד", defaultValue: "ערב עיון מיוחד", fontSize: "2xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "subtitle", label: "כותרת משנה", placeholder: "בנושא: אמונה ובטחון", defaultValue: "בנושא: אמונה ובטחון", fontSize: "lg", fontFamily: "serif" },
  { id: "speaker", label: "שם המרצה / אורח כבוד", placeholder: "הרב פלוני שליט\"א", defaultValue: "הרב פלוני שליט\"א", fontSize: "xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "speaker_title", label: "תואר / תפקיד", placeholder: "ראש ישיבת...", defaultValue: "ראש ישיבת בית שמים, בני ברק", fontSize: "sm" },
  { id: "body_text", label: "תיאור האירוע", placeholder: "הכניסה חופשית לכל...", defaultValue: "הכניסה חופשית לכולם\nנשים בנפרד", multiline: true, fontSize: "sm" },
  { id: "date_heb", label: "תאריך עברי", placeholder: "יום ג׳ י\"ח שבט", defaultValue: "יום ג׳ י\"ח שבט", fontSize: "md", fontFamily: "serif", bold: true },
  { id: "date_civil", label: "תאריך לועזי", placeholder: "04.02.2026", defaultValue: "04.02.2026", fontSize: "sm" },
  { id: "time", label: "שעה", placeholder: "בשעה 20:00", defaultValue: "בשעה 20:00", fontSize: "sm" },
  { id: "location", label: "מיקום", placeholder: "בית הכנסת המרכזי", defaultValue: "בית הכנסת המרכזי, רחוב הרב קוק 5", fontSize: "sm", bold: true },
  { id: "org", label: "גוף מארגן", placeholder: "בהוצאת מוסדות...", defaultValue: "בהוצאת מוסדות תורת אמת", fontSize: "xs" },
];

const barMitzvahSlots: TextSlot[] = [
  { id: "top_verse", label: "ברכה פותחת", placeholder: "בס\"ד", defaultValue: "בס\"ד", fontSize: "sm", fontFamily: "serif", color: "gold" },
  { id: "occasion", label: "סיבת השמחה", placeholder: "לכבוד שמחת הבר מצווה", defaultValue: "לכבוד שמחת הבר מצווה", fontSize: "lg", fontFamily: "serif", color: "gold" },
  { id: "boy_name", label: "שם הבר מצווה", placeholder: "יצחק מאיר", defaultValue: "יצחק מאיר", fontSize: "2xl", fontFamily: "serif", bold: true, color: "gold" },
  { id: "father_name", label: "שם האב", placeholder: "בן כבוד אביו ר׳ אברהם", defaultValue: "בן כבוד אביו ר׳ אברהם", fontSize: "sm" },
  { id: "parasha", label: "פרשת השבוע", placeholder: "פרשת תרומה", defaultValue: "פרשת תרומה", fontSize: "md", fontFamily: "serif", bold: true },
  { id: "invitation_text", label: "טקסט הזמנה", placeholder: "מזמינים אתכם לשמוח עמנו...", defaultValue: "מזמינים אתכם לשמוח בשמחתנו\nבסעודת מצווה", multiline: true, fontSize: "sm" },
  { id: "date_heb", label: "תאריך עברי", placeholder: "שבת קודש א׳ אדר", defaultValue: "שבת קודש א׳ אדר תשפ״ו", fontSize: "md", fontFamily: "serif", bold: true },
  { id: "date_civil", label: "תאריך לועזי", placeholder: "21.02.2026", defaultValue: "שבת, 21.02.2026", fontSize: "sm" },
  { id: "location_shul", label: "בית הכנסת", placeholder: "בית כנסת...", defaultValue: "בית כנסת אוהל אברהם, בני ברק", fontSize: "sm", bold: true },
  { id: "location_hall", label: "אולם הסעודה", placeholder: "אולם...", defaultValue: "אולם גן עדן, ביאליק 14", fontSize: "sm" },
  { id: "parents", label: "שם ההורים", placeholder: "משפחת כהן", defaultValue: "המשפחה לכל ענפיה", fontSize: "xs" },
];

export const templates: Template[] = [
  {
    id: "1",
    title: "שבת שבתון",
    subtitle: "הזמנה לקידוש",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 29,
    image: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    isGradient: true,
    slots: kiddushSlots,
  },
  {
    id: "2",
    title: "יום שמחתנו",
    subtitle: "הזמנה לחתונה",
    category: "הזמנות לחתונה",
    style: "יוקרתי",
    price: 79,
    image: weddingImg,
    slots: weddingSlots,
  },
  {
    id: "3",
    title: "כי הגיע הזמן",
    subtitle: "מודעה לבר מצווה",
    category: "מודעות לאירועים",
    style: "קלאסי",
    price: 49,
    image: barMitzvahImg,
    slots: barMitzvahSlots,
  },
  {
    id: "4",
    title: "עמוד ישיבה",
    subtitle: "מודעה לשיעור תורה",
    category: "מודעות לישיבות",
    style: "מינימליסטי",
    price: 19,
    image: torahClassImg,
    slots: eventSlots,
  },
  {
    id: "5",
    title: "פרשת השבוע",
    subtitle: "עיצוב לשבת",
    category: "מודעות לאירועים",
    style: "מודרני",
    price: 25,
    image: "linear-gradient(135deg, #331520 0%, #1a0b10 100%)",
    isGradient: true,
    slots: eventSlots,
  },
  {
    id: "6",
    title: "יד עוזרת",
    subtitle: "פוסטר גיוס תרומות",
    category: "מודעות לאירועים",
    style: "חסידי",
    price: 39,
    image: charityImg,
    slots: eventSlots,
  },
  {
    id: "7",
    title: "בית חדש שמחה חדשה",
    subtitle: "הזמנה לחנוכת הבית",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 35,
    image: "linear-gradient(135deg, #172554 0%, #082f49 100%)",
    isGradient: true,
    slots: kiddushSlots,
  },
  {
    id: "8",
    title: "ערב עיון",
    subtitle: "מודעה לאירוע ישיבה",
    category: "מודעות לישיבות",
    style: "קלאסי",
    price: 29,
    image: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    isGradient: true,
    slots: eventSlots,
  },
  {
    id: "9",
    title: "ברוכים הבאים",
    subtitle: "קליפ וידאו לחתונה",
    category: "תבניות וידאו",
    style: "יוקרתי",
    price: 120,
    image: videoImg,
    slots: weddingSlots,
  },
  {
    id: "10",
    title: "ליל הסדר",
    subtitle: "עיצוב לחג הפסח",
    category: "עיצובים לחגים",
    style: "מינימליסטי",
    price: 45,
    image: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
    isGradient: true,
    slots: eventSlots,
  },
  {
    id: "11",
    title: "שמחת הברית",
    subtitle: "הזמנה לברית מילה",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 55,
    image: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
    isGradient: true,
    slots: kiddushSlots,
  },
  {
    id: "12",
    title: "קול קורא",
    subtitle: "פוסטר לאסיפה חשובה",
    category: "מודעות לישיבות",
    style: "חסידי",
    price: 22,
    image: "linear-gradient(135deg, #022c22 0%, #450a0a 100%)",
    isGradient: true,
    slots: eventSlots,
  }
];
