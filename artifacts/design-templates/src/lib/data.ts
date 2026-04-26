import weddingImg from "../assets/images/wedding.png";
import barMitzvahImg from "../assets/images/bar-mitzvah.png";
import torahClassImg from "../assets/images/torah-class.png";
import charityImg from "../assets/images/charity.png";
import videoImg from "../assets/images/video.png";

export interface Template {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  style: string;
  price: number;
  image: string;
  isGradient?: boolean;
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

export const templates: Template[] = [
  {
    id: "1",
    title: "שבת שבתון",
    subtitle: "הזמנה לקידוש",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 29,
    image: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    isGradient: true
  },
  {
    id: "2",
    title: "יום שמחתנו",
    subtitle: "הזמנה לחתונה",
    category: "הזמנות לחתונה",
    style: "יוקרתי",
    price: 79,
    image: weddingImg
  },
  {
    id: "3",
    title: "כי הגיע הזמן",
    subtitle: "מודעה לבר מצווה",
    category: "מודעות לאירועים",
    style: "קלאסי",
    price: 49,
    image: barMitzvahImg
  },
  {
    id: "4",
    title: "עמוד ישיבה",
    subtitle: "מודעה לשיעור תורה",
    category: "מודעות לישיבות",
    style: "מינימליסטי",
    price: 19,
    image: torahClassImg
  },
  {
    id: "5",
    title: "פרשת השבוע",
    subtitle: "עיצוב לשבת",
    category: "מודעות לאירועים",
    style: "מודרני",
    price: 25,
    image: "linear-gradient(135deg, #331520 0%, #1a0b10 100%)",
    isGradient: true
  },
  {
    id: "6",
    title: "יד עוזרת",
    subtitle: "פוסטר גיוס תרומות",
    category: "מודעות לאירועים",
    style: "חסידי",
    price: 39,
    image: charityImg
  },
  {
    id: "7",
    title: "בית חדש שמחה חדשה",
    subtitle: "הזמנה לחנוכת הבית",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 35,
    image: "linear-gradient(135deg, #172554 0%, #082f49 100%)",
    isGradient: true
  },
  {
    id: "8",
    title: "ערב עיון",
    subtitle: "מודעה לאירוע ישיבה",
    category: "מודעות לישיבות",
    style: "קלאסי",
    price: 29,
    image: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    isGradient: true
  },
  {
    id: "9",
    title: "ברוכים הבאים",
    subtitle: "קליפ וידאו לחתונה",
    category: "תבניות וידאו",
    style: "יוקרתי",
    price: 120,
    image: videoImg
  },
  {
    id: "10",
    title: "ליל הסדר",
    subtitle: "עיצוב לחג הפסח",
    category: "עיצובים לחגים",
    style: "מינימליסטי",
    price: 45,
    image: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
    isGradient: true
  },
  {
    id: "11",
    title: "שמחת הברית",
    subtitle: "הזמנה לברית מילה",
    category: "הזמנות לקידוש",
    style: "זהב",
    price: 55,
    image: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
    isGradient: true
  },
  {
    id: "12",
    title: "קול קורא",
    subtitle: "פוסטר לאסיפה חשובה",
    category: "מודעות לישיבות",
    style: "חסידי",
    price: 22,
    image: "linear-gradient(135deg, #022c22 0%, #450a0a 100%)",
    isGradient: true
  }
];
