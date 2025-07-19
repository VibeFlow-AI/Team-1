import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import GallerySection from "@/components/gallery-section";
import SessionsSection from "@/components/sessions-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <GallerySection />
      <SessionsSection />
      <Footer />
    </main>
  );
}
