
"use client";

import React from "react";
import AboutConnect from "./AboutConnect";
import AboutSlider from "./AboutSlider";
import MoreForYou from "./MoreForYou";
import FaqSection from "./FaqSection";

const AboutSection = () => {
  return (
    <div className="bg-white">
      {/* Top Section: Connect + Slider */}
      <section className="about-section py-10 md:py-20 border-b border-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <AboutConnect />
            <AboutSlider />
          </div>
        </div>
      </section>

      {/* Features: More for You */}
      <MoreForYou />

      {/* FAQ: Frequently Asked Questions */}
      <FaqSection />
    </div>
  );
};

export default AboutSection;

