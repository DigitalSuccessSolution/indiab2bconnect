import React from "react";
import {
  Building2,
  Castle,
  Landmark,
  Building,
  Tent,
  Store,
  Map,
  TowerControl,
  Navigation,
  Factory,
  Warehouse,
  Trees,
  Mountain,
  Waves
} from "lucide-react";

// City data with image paths and beautiful generic fallback icons
const cities = [
  { name: "Delhi", image: "/images/cities/delhi.png", Fallback: Landmark },
  { name: "Bengaluru", image: "/images/cities/bengaluru.png", Fallback: Building2 },
  { name: "Chennai", image: "/images/cities/chennai.png", Fallback: Store },
  { name: "Mumbai", image: "/images/cities/mumbai.png", Fallback: Castle },
  { name: "Ahmedabad", image: "/images/cities/ahmedabad.png", Fallback: Tent },
  { name: "Kolkata", image: "/images/cities/kolkata.png", Fallback: TowerControl },
  { name: "Pune", image: "/images/cities/pune.png", Fallback: Building },
  { name: "Surat", image: "/images/cities/surat.png", Fallback: Map },
  { name: "Jaipur", image: "/images/cities/jaipur.png", Fallback: Castle },
  { name: "Hyderabad", image: "/images/cities/hyderabad.png", Fallback: Navigation },
  { name: "Lucknow", image: "/images/cities/lucknow.png", Fallback: Castle },
  { name: "Kanpur", image: "/images/cities/kanpur.png", Fallback: Factory },
  { name: "Indore", image: "/images/cities/indore.png", Fallback: Warehouse },
  { name: "Chandigarh", image: "/images/cities/chandigarh.png", Fallback: Trees },
  { name: "Kochi", image: "/images/cities/kochi.png", Fallback: Waves },
];

const CityIcon = ({ city }) => {
  const Icon = city.Fallback;
  const router = require("next/navigation").useRouter();

  return (
    <div
      onClick={() => router.push(`/search?city=${city.name}`)}
      className="flex flex-col items-center group cursor-pointer min-w-[90px] sm:min-w-[110px] md:min-w-0 shrink-0 snap-start"
    >
      <div 
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:scale-105 group-hover:border-[#164e33]/40 group-hover:bg-white group-hover:shadow-[0_12px_30px_-8px_rgba(22,78,51,0.08)] relative overflow-hidden"
        style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        {/* The Icon */}
        <Icon 
          className="w-8 h-8 md:w-10 md:h-10 text-slate-800 group-hover:text-[#164e33] stroke-[1.5]"
          style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
        />
      </div>

      <span 
        className="text-[12px] md:text-base font-medium text-slate-700 group-hover:text-[#164e33]"
        style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        {city.name}
      </span>
    </div>
  );
};

const CitySuppliers = () => {
  return (
    <section className="w-full bg-white py-8 md:py-10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <h2 className="text-xl md:text-3xl font-medium text-slate-900 mb-6 md:mb-8">
          Explore Vendors by City
        </h2>

        <div className="flex flex-nowrap md:grid md:grid-cols-5 gap-6 md:gap-y-8 md:gap-x-4 overflow-x-auto pt-2 pb-4 md:pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 -mx-1 md:px-0 md:mx-0">
          {cities.map((city) => (
            <CityIcon key={city.name} city={city} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CitySuppliers;
