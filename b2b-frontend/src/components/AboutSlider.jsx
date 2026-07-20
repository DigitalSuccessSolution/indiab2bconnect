"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AboutSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, src: "/s1.webp", alt: "Banner 1" },
    { id: 2, src: "/s2.webp", alt: "Banner 2" },
    { id: 3, src: "/s3.webp", alt: "Banner 3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="lg:flex-7 w-full flex flex-col items-center">
      <div className="relative w-full aspect-21/9 rounded-lg md:rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Slider Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + slides.length) % slides.length,
            )
          }
          className="absolute hidden md:block left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % slides.length)
          }
          className="absolute hidden md:block right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all cursor-pointer group"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSlider;
