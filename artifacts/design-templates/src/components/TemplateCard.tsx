import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Palette } from "lucide-react";
import { Template } from "../lib/data";

interface TemplateCardProps {
  template: Template;
  index: number;
}

export function TemplateCard({ template, index }: TemplateCardProps) {
  return (
    <div 
      className="group flex flex-col rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm border border-card-border shadow-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden w-full">
        {template.isGradient ? (
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
            style={{ background: template.image }}
          >
            <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-4 border border-white/10 rounded-lg flex items-center justify-center p-6 text-center">
              <h3 className="font-serif text-3xl font-light text-white/80">{template.title}</h3>
            </div>
          </div>
        ) : (
          <img 
            src={template.image} 
            alt={template.title} 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-white/10 text-xs font-medium">
            {template.category}
          </Badge>
          <Badge variant="outline" className="bg-primary/10 backdrop-blur-md border-primary/20 text-primary text-xs font-medium">
            {template.style}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">{template.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{template.subtitle}</p>
          </div>
          <span className="font-sans font-bold text-lg text-primary">₪{template.price}</span>
        </div>

        <div className="mt-auto pt-4 flex gap-2 w-full">
          <Link href={`/template/${template.id}`} className="flex-1">
            <Button variant="default" className="w-full bg-primary/90 hover:bg-primary text-primary-foreground group/btn relative overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <Palette className="w-4 h-4 ml-2 relative z-10" />
              <span className="relative z-10">התאמה אישית</span>
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
            <Download className="w-4 h-4 ml-2" />
            הורדה
          </Button>
        </div>
      </div>
    </div>
  );
}
