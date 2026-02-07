import { Hero } from '@/components/Hero';
import { RecentOffers } from '@/components/RecentOffers';

export function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <RecentOffers />
    </div>
  );
}
