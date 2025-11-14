import { SignedIn, UserButton } from "@clerk/nextjs";
import Hero from "@/components/landing/hero";
import { Features } from "../components/landing/features";
import { HowItWorks } from "@/components/landing/hot-it-works";
import { CTA } from "@/components/landing/cta";
import Pricing from "@/components/landing/pricing";


export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <Hero />
      <Features />
      <HowItWorks />

      <SignedIn>
        <div className="fixed top-4 right-4">
          <UserButton />
        </div>
      </SignedIn>
      <Pricing />
      <CTA />
    </main>
  );
}
