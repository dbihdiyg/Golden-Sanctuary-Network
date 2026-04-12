import React from "react";
import Hero from "@/components/sections/Hero";
import Updates from "@/components/sections/Updates";
import Gallery from "@/components/sections/Gallery";
import VideoSection from "@/components/sections/VideoSection";
import PDFLibrary from "@/components/sections/PDFLibrary";
import CommunityFeed from "@/components/sections/CommunityFeed";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="w-full flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-50 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_80%_70%,white_1px,transparent_1px)] bg-[length:26px_26px]"></div>
      
      <Hero />
      
      <div className="relative z-10 bg-background">
        <Updates />
        <Gallery />
        <VideoSection />
        <PDFLibrary />
        <CommunityFeed />
        <Footer />
      </div>
    </main>
  );
}
