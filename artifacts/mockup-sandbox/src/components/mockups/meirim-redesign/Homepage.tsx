import React, { useEffect, useRef } from "react";
import { 
  BookOpen, 
  MessageSquare, 
  Target, 
  Lock, 
  ChevronLeft,
  Users,
  FileText,
  CalendarDays,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return ref;
}

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 opacity-0 translate-y-8 ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Homepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] font-['Heebo'] text-[#1A1A1A] overflow-x-hidden selection:bg-[#3A7DFF] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold text-[#0F1A2B] tracking-tight">מאירים</span>
              <div className="w-2 h-2 rounded-full bg-[#3A7DFF] mt-1"></div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-[#0F1A2B] font-medium hover:text-[#3A7DFF] transition-colors">בית</a>
              <a href="#" className="text-[#64748B] font-medium hover:text-[#3A7DFF] transition-colors">קהילה</a>
              <a href="#" className="text-[#64748B] font-medium hover:text-[#3A7DFF] transition-colors">פורום</a>
              <a href="#" className="text-[#64748B] font-medium hover:text-[#3A7DFF] transition-colors">ספרייה</a>
              <a href="#" className="text-[#64748B] font-medium hover:text-[#3A7DFF] transition-colors">צור קשר</a>
            </div>

            <div className="hidden md:flex items-center">
              <Button className="bg-[#3A7DFF] hover:bg-[#2563EB] text-white rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-all">
                כניסה לקהילה
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#0F1A2B]">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E2E8F0] px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-[#0F1A2B] bg-[#F1F5F9]">בית</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-[#64748B] hover:text-[#0F1A2B] hover:bg-[#F1F5F9]">קהילה</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-[#64748B] hover:text-[#0F1A2B] hover:bg-[#F1F5F9]">פורום</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-[#64748B] hover:text-[#0F1A2B] hover:bg-[#F1F5F9]">ספרייה</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-[#64748B] hover:text-[#0F1A2B] hover:bg-[#F1F5F9]">צור קשר</a>
            <div className="pt-4">
              <Button className="w-full bg-[#3A7DFF] hover:bg-[#2563EB] text-white rounded-full">
                כניסה לקהילה
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[#F8FAFC] overflow-hidden -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-70"></div>
            <div className="absolute right-0 top-1/4 w-96 h-96 bg-[#3A7DFF] opacity-[0.03] rounded-full blur-3xl"></div>
            <div className="absolute left-1/4 top-1/2 w-64 h-64 bg-[#D4AF37] opacity-[0.03] rounded-full blur-3xl"></div>
            <div 
              className="absolute inset-0 opacity-[0.4]" 
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8FAFC]/50 to-[#F8FAFC]"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8 shadow-sm">
                <span className="text-lg">🏆</span>
                <span className="text-sm font-semibold text-[#3A7DFF] tracking-wide">קהילת בוגרים פעילה • תשפ״ו</span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#0F1A2B] leading-[1.1] mb-6 tracking-tight">
                כל הידע, הקשרים והזיכרונות <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A7DFF] to-blue-400">במקום אחד</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-lg md:text-xl text-[#64748B] mb-10 max-w-2xl mx-auto leading-relaxed">
                הצטרפו לאלפי בוגרי מאירים — פלטפורמה דיגיטלית לחיבור קהילתי, שיתוף תוכן ומעורבות פעילה.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button className="w-full sm:w-auto bg-[#3A7DFF] hover:bg-[#2563EB] text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
                  כניסה לקהילה <ChevronLeft size={20} className="mr-1" />
                </Button>
                <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0F1A2B] border-[#E2E8F0] rounded-full px-8 py-6 text-lg font-medium shadow-sm transition-all hover:-translate-y-0.5">
                  גלה את הפלטפורמה
                </Button>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-[#E2E8F0]/60 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-[#0F1A2B] mb-1">1,200+</span>
                  <span className="text-sm font-medium text-[#64748B]">בוגרים מחוברים</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-[#0F1A2B] mb-1">150+</span>
                  <span className="text-sm font-medium text-[#64748B]">תכנים ושיעורים</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-[#0F1A2B] mb-1">5</span>
                  <span className="text-sm font-medium text-[#64748B]">שנים של קהילה פעילה</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F1A2B] mb-4 tracking-tight">הכול במקום אחד</h2>
              <div className="w-16 h-1 bg-[#3A7DFF] mx-auto rounded-full"></div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={100} className="h-full">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]/50 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
                <div className="w-14 h-14 bg-blue-50 text-[#3A7DFF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#3A7DFF] group-hover:text-white transition-all duration-300">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0F1A2B] mb-3">ספריית תכנים</h3>
                <p className="text-[#64748B] leading-relaxed">
                  גישה לגליונות, שיעורים, הרצאות — מאורגן ומסונן בקלות לפי נושאים, זמנים ומרצים.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200} className="h-full">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]/50 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
                <div className="w-14 h-14 bg-blue-50 text-[#3A7DFF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#3A7DFF] group-hover:text-white transition-all duration-300">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0F1A2B] mb-3">פורום קהילתי</h3>
                <p className="text-[#64748B] leading-relaxed">
                  שאלות, דיונים ושיתוף — כולם מדברים, כולם שומעים. מרחב בטוח וסגור לבוגרים בלבד.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300} className="h-full">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]/50 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
                <div className="w-14 h-14 bg-blue-50 text-[#3A7DFF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#3A7DFF] group-hover:text-white transition-all duration-300">
                  <Target size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0F1A2B] mb-3">עדכונים ואירועים</h3>
                <p className="text-[#64748B] leading-relaxed">
                  הישארו מעודכנים על כל אירוע, מפגש ושיתוף חשוב. הרשמה חכמה ותזכורות בזמן אמת.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Community Showcase Section */}
      <section className="py-24 bg-[#0F1A2B] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#3A7DFF]/10 rounded-full blur-[100px] -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-sm font-medium text-white/80">קהילה חיה ופעילה</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                  יותר ממעגל חברתי,<br/>
                  <span className="text-[#3A7DFF]">בית שני לבוגרים</span>
                </h2>
                <p className="text-[#94A3B8] text-lg mb-10 max-w-lg leading-relaxed">
                  הפלטפורמה שלנו תוכננה בקפידה כדי לאפשר דיונים מעמיקים, שיתוף ידע נגיש וחיבורים אמיתיים בין כל המחזורים.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-4">
                <Reveal delay={100}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <Users className="text-[#3A7DFF] mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">1,200</div>
                    <div className="text-sm text-[#94A3B8]">חברים פעילים</div>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <FileText className="text-[#D4AF37] mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">8,500+</div>
                    <div className="text-sm text-[#94A3B8]">פוסטים בפורום</div>
                  </div>
                </Reveal>
                <Reveal delay={300} className="col-span-2">
                  <div className="bg-[#3A7DFF]/10 border border-[#3A7DFF]/20 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">24</div>
                      <div className="text-sm text-[#94A3B8]">אירועים קרובים</div>
                    </div>
                    <CalendarDays className="text-[#3A7DFF]" size={32} />
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Mockup Right Side */}
            <div className="order-1 lg:order-2 relative">
              <Reveal delay={200}>
                <div className="relative mx-auto max-w-[500px]">
                  {/* Decorative blur behind mockup */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#3A7DFF]/20 to-[#D4AF37]/10 blur-2xl rounded-full"></div>
                  
                  {/* Mockup Container */}
                  <div className="relative bg-[#1E293B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Mockup Header */}
                    <div className="bg-[#0F1A2B] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <div className="font-semibold text-white">פיד קהילה</div>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                      </div>
                    </div>
                    
                    {/* Mockup Content */}
                    <div className="p-6 space-y-4 bg-[#0F1A2B]/50 h-[400px] overflow-hidden relative">
                      {/* Gradient fade at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1E293B] to-transparent z-10 pointer-events-none"></div>

                      {/* Post 1 */}
                      <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-[#3A7DFF] flex items-center justify-center text-white font-bold text-sm">יכ</div>
                          <div>
                            <div className="text-white text-sm font-medium">ישראל כהן</div>
                            <div className="text-[#64748B] text-xs">לפני שעתיים • מחזור ט"ו</div>
                          </div>
                        </div>
                        <p className="text-[#CBD5E1] text-sm leading-relaxed mb-3">
                          שמח לשתף אתכם בסיכום השיעור של הרב מאתמול בנושא הלכות שבת. מוזמנים לעיין ולהוסיף הערות.
                        </p>
                        <div className="flex items-center gap-4 text-[#64748B] text-xs">
                          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> 12 תגובות</span>
                          <span className="flex items-center gap-1.5"><Target size={14} /> 45 צפיות</span>
                        </div>
                      </div>

                      {/* Post 2 */}
                      <div className="bg-[#1E293B] p-4 rounded-2xl border border-[#3A7DFF]/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-[#3A7DFF]"></div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-yellow-600 flex items-center justify-center text-white font-bold text-sm">מל</div>
                          <div>
                            <div className="text-white text-sm font-medium flex items-center gap-2">
                              מנהל הקהילה
                              <span className="bg-[#3A7DFF]/20 text-[#3A7DFF] text-[10px] px-2 py-0.5 rounded-full font-bold">הודעה חשובה</span>
                            </div>
                            <div className="text-[#64748B] text-xs">לפני 5 שעות</div>
                          </div>
                        </div>
                        <p className="text-[#CBD5E1] text-sm leading-relaxed">
                          ההרשמה לכנס הבוגרים השנתי נפתחה! הבטיחו את מקומכם בהקדם, מספר המקומות מוגבל השנה עקב...
                        </p>
                      </div>

                      {/* Post 3 (partially hidden) */}
                      <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/5 shadow-sm opacity-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">אל</div>
                          <div>
                            <div className="text-white text-sm font-medium">אברהם לוי</div>
                            <div className="text-[#64748B] text-xs">אתמול • מחזור כ"א</div>
                          </div>
                        </div>
                        <p className="text-[#CBD5E1] text-sm leading-relaxed">
                          מחפש חברותא ללימוד דף היומי באזור ירושלים...
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#3A7DFF] -z-20"></div>
        {/* Glows and patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent opacity-60 -z-10"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 -z-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">מוכנים להצטרף?</h2>
            <p className="text-blue-100 text-xl md:text-2xl mb-10 font-medium">הצטרפות חינמית — לבוגרי מאירים בלבד</p>
            
            <div className="flex flex-col items-center justify-center gap-4">
              <Button className="bg-white hover:bg-gray-50 text-[#0F1A2B] rounded-full px-10 py-7 text-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 w-full sm:w-auto">
                הירשם לקהילה עכשיו
              </Button>
              <div className="flex items-center gap-2 text-blue-100/80 text-sm font-medium mt-4">
                <Lock size={16} />
                <span>כניסה מאובטחת לבוגרים רשומים בלבד</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1A2B] pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white tracking-tight">מאירים</span>
                <div className="w-2 h-2 rounded-full bg-[#3A7DFF] mt-1"></div>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed pr-2">
                הפלטפורמה הרשמית לבוגרי מוסדות מאירים. מחברים את העבר, ההווה והעתיד של הקהילה שלנו.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">ניווט מהיר</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">עמוד הבית</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">אודות הקהילה</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">צוות ההנהלה</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">צור קשר</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">תוכן ופעילות</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">ספריית התכנים</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">פורום הבוגרים</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">לוח אירועים</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">עדכונים שוטפים</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">תמיכה ומידע</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">שאלות נפוצות</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">תקנון האתר</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">מדיניות פרטיות</a></li>
                <li><a href="#" className="text-[#64748B] hover:text-[#3A7DFF] transition-colors text-sm">דיווח על תקלה</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#64748B] text-sm">
              © {new Date().getFullYear()} בוגרי מאירים. כל הזכויות שמורות.
            </p>
            <div className="text-[#64748B] text-xs bg-white/5 px-3 py-1.5 rounded-full">
              פותח באהבה עבור קהילת מאירים
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
