import { useState, memo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Palette, MessageCircle, Copy } from "lucide-react";
import { Template } from "../lib/data";
import { motion } from "framer-motion";

interface TemplateCardProps {
  template: Template;
  index: number;
}

export const TemplateCard = memo(function TemplateCard({ template, index }: TemplateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/template/${template.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`ראיתי את התבנית "${template.title}" באתר הדר ואשמח לפרטים!`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`group flex flex-col rounded-2xl overflow-hidden bg-secondary backdrop-blur-sm border border-primary/20 shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:border-primary/60`}
    >
      <div className="relative aspect-[3/4] overflow-hidden w-full bg-background/50">
        {template.isGradient ? (
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110"
            style={{ background: template.image }}
          >
            <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-4 border border-white/10 rounded-xl flex items-center justify-center p-6 text-center">
              <h3 className="font-serif text-4xl font-bold text-white/90 drop-shadow-md">{template.title}</h3>
            </div>
          </div>
        ) : (
          <img 
            src={template.image} 
            alt={template.title} 
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-primary/30 text-primary text-xs font-medium px-3 py-1">
            {template.category}
          </Badge>
          <Badge variant="outline" className="bg-secondary/90 backdrop-blur-md border-white/20 text-foreground text-xs font-medium px-3 py-1">
            {template.style}
          </Badge>
        </div>
        {template.dimensions && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm border-primary/20 text-primary/80 text-[10px] font-mono px-2 py-0.5">
              {template.dimensions.preset !== "Custom"
                ? template.dimensions.preset
                : `${template.dimensions.width}×${template.dimensions.height}`}
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-10 bg-secondary">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{template.title}</h3>
            <p className="text-sm text-muted-foreground">{template.subtitle}</p>
          </div>
          <div className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
            <span className="font-sans font-bold text-lg text-primary">₪{template.price}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-3 w-full">
          <div className="flex gap-3 w-full">
            <Link href={`/template/${template.id}`} className="flex-1">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 transition-colors">
                <Palette className="w-4 h-4 ml-2" />
                התאמה אישית
              </Button>
            </Link>
            <Button variant="default" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 ml-2" />
              הורדה
            </Button>
          </div>
          <div className="flex gap-3 items-center justify-end text-xs text-muted-foreground mt-2">
            <button onClick={handleWhatsAppShare} className="flex items-center gap-1 hover:text-[#25D366] transition-colors">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              שיתוף
            </button>
            <button onClick={handleCopyLink} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Copy className="w-3.5 h-3.5" />
              {copied ? "הועתק!" : "העתק קישור"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});