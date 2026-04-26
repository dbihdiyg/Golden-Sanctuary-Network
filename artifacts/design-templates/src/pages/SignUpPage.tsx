import { SignUp } from "@clerk/react";
import { Crown } from "lucide-react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-8" dir="rtl">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-1 group">
          <div className="relative">
            <Crown className="w-6 h-6 text-primary absolute -top-5 left-1/2 -translate-x-1/2" />
            <span className="font-serif font-bold text-4xl text-foreground">הדר</span>
          </div>
          <span className="text-sm text-muted-foreground mt-4 group-hover:text-primary transition-colors">
            הצטרפו לסטודיו לעיצוב הזמנות
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          appearance={{
            variables: {
              colorPrimary: "#D6A84F",
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorInputBackground: "hsl(var(--card))",
              colorInputText: "hsl(var(--foreground))",
              borderRadius: "0.75rem",
              fontFamily: "'Heebo', sans-serif",
            },
            elements: {
              card: "shadow-2xl border border-primary/20 !bg-card",
              headerTitle: "font-serif text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "!bg-primary hover:!bg-primary/90 font-bold",
              footerActionLink: "!text-primary hover:!text-primary/80",
              formFieldInput: "!bg-background !text-foreground border-primary/20",
              dividerLine: "!bg-primary/20",
            },
          }}
        />
      </div>
    </div>
  );
}
