import Hero from "@/components/sections/Hero";
import PesachExclusive from "@/components/sections/PesachExclusive";
import Updates from "@/components/sections/Updates";
import Gallery from "@/components/sections/Gallery";
import LiveSection from "@/components/sections/LiveSection";
import PDFLibrary from "@/components/sections/PDFLibrary";
import CommunityFeed from "@/components/sections/CommunityFeed";
import Footer from "@/components/sections/Footer";
import CategoryHub from "@/components/sections/CategoryHub";
import MediaSpotlight from "@/components/sections/MediaSpotlight";
import QuickActions from "@/components/sections/QuickActions";
import Inspiration from "@/components/sections/Inspiration";
import FeaturedShiur from "@/components/sections/FeaturedShiur";
import CommunityEventBanner from "@/components/sections/CommunityEventBanner";
import Announcements from "@/components/sections/Announcements";
import SpecialBanners from "@/components/sections/SpecialBanners";

export default function Home() {
  return (
    <main className="w-full flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-50 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_80%_70%,white_1px,transparent_1px)] bg-[length:26px_26px]"></div>
      
      <Hero />
      
      <div className="relative z-10 bg-background">
        <Announcements />
        <SpecialBanners />
        <CommunityEventBanner />
        <FeaturedShiur />
        <PesachExclusive />
        <CategoryHub />
        <QuickActions />
        <Updates />
        <MediaSpotlight />
        <Gallery />
        <LiveSection />
        <PDFLibrary />
        <CommunityFeed />
        <Inspiration />
        <Footer />
      </div>
    </main>
  );
}
