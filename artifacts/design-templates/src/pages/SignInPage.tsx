import { SignIn } from "@clerk/react";
import hadarLogo from "@/assets/logo-hadar.png";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function HadarBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B1833 0%, #0f2040 60%, #0B1833 100%)" }} />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(ellipse at 20% 50%, #D6A84F22 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, #D6A84F15 0%, transparent 50%)`
      }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute border border-primary/5 rounded-full" style={{
          width: `${200 + i * 120}px`, height: `${200 + i * 120}px`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.5 - i * 0.07,
        }} />
      ))}
      <div className="absolute top-8 right-8 text-primary/10 text-9xl font-serif select-none">ה</div>
      <div className="absolute bottom-8 left-8 text-primary/10 text-9xl font-serif select-none">ד</div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative" dir="rtl">
      <HadarBackground />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Custom branded header */}
        <Link href="/" className="group mb-8 flex flex-col items-center gap-2">
          <div className="mb-1">
            <img src={hadarLogo} alt="הדר" style={{ height: 80, width: "auto", objectFit: "contain" }} />
          </div>
          <div className="w-16 h-px bg-primary/40 mt-1" />
          <p className="text-sm text-primary/70 tracking-widest font-light mt-1">סטודיו לעיצוב הזמנות</p>
        </Link>

        {/* Clerk sign-in with hidden header */}
        <div className="w-full [&_.cl-card]:!bg-[#0d1f3c] [&_.cl-card]:!border [&_.cl-card]:!border-primary/25 [&_.cl-card]:!shadow-2xl">
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            appearance={{
              variables: {
                colorPrimary: "#D6A84F",
                colorBackground: "#0d1f3c",
                colorText: "#F8F1E3",
                colorInputBackground: "#0a1a30",
                colorInputText: "#F8F1E3",
                colorTextSecondary: "#9ba8b5",
                colorTextOnPrimaryBackground: "#0B1833",
                borderRadius: "0.875rem",
                fontFamily: "'Heebo', sans-serif",
                fontSize: "15px",
                spacingUnit: "18px",
              },
              elements: {
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                card: "!shadow-none !bg-transparent !border-0 !p-0",
                cardBox: "!shadow-2xl !rounded-2xl !border !border-[#D6A84F]/25 !bg-[#0d1f3c]",
                formButtonPrimary: "!bg-primary hover:!opacity-90 !font-bold !text-[#0B1833] !tracking-wide",
                socialButtonsBlockButton: "!border-primary/25 hover:!bg-primary/10 !text-foreground",
                socialButtonsBlockButtonText: "!text-[#F8F1E3]",
                footerActionLink: "!text-primary hover:!text-primary/80",
                formFieldInput: "!bg-[#0a1a30] !text-[#F8F1E3] !border-primary/20 focus:!border-primary/60",
                formFieldLabel: "!text-[#9ba8b5]",
                dividerLine: "!bg-primary/20",
                dividerText: "!text-[#9ba8b5]",
                identityPreviewText: "!text-[#F8F1E3]",
                identityPreviewEditButton: "!text-primary",
                otpCodeFieldInput: "!bg-[#0a1a30] !text-[#F8F1E3] !border-primary/30",
                footerAction: "!bg-transparent",
                footer: "!bg-transparent",
              },
            }}
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground/50 text-center flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary/40" />
          מאובטח ומוצפן — Clerk Authentication
        </p>
      </div>
    </div>
  );
}
