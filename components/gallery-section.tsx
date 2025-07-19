"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  description?: string;
}

const initialImages: GalleryItem[] = [
  {
    src: "/gallery/personalized-learning.png",
    alt: "Personalized Learning",
    title: "Tailored Learning for You",
    description:
      "Each session is customized to your unique goals and pace—making learning more personal, focused, and effective."
  },
  {
    src: "/gallery/real-mentors.png",
    alt: "Real Mentors, Real Guidance",
    title: "Real Mentors. Real Impact.",
    description:
      "Our mentors are experienced, approachable, and here to support your academic and career growth every step of the way."
  },
  {
    src: "/gallery/growth-career.png",
    alt: "Growth & Career Readiness",
    title: "Built for Career Growth",
    description:
      "Explore sessions designed to sharpen your resume, prep for interviews, and map out your next big career move."
  },
  {
    src: "/gallery/insights-support.png",
    alt: "Insights-Driven Support",
    title: "Support Backed by Insight",
    description:
      "Access mentorship powered by experience, data, and student feedback—so you get smarter, more targeted help."
  }
];

export default function GallerySection() {
  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setImages((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setIsAnimating(false);
      }, 400); // Animation duration
    }, 2000); // Change every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="gallery" className="py-20 bg-gradient-to-r from-blue-50 to-green-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-6xl font-normal text-black mb-4">
            What's in it for Students?
          </h2>
          <p className="text-2xl text-black max-w-3xl mx-auto">
            Discover how EduVibe mentors help you navigate challenges, explore opportunities, and build real-world readiness—all tailored just for you.
          </p>
        </div>
        
        {/* Sliding Cards Container */}
        <div className="relative h-80 overflow-hidden">
          <div className="flex gap-6 h-full transition-transform duration-400 ease-in-out">
            {images.map((item, idx) => {
              let cardClasses = "relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-400 ease-in-out transform flex-shrink-0";
              let widthClasses = "";
              let transformClasses = "";
              
              if (isAnimating) {
                // During animation: slide all cards left
                transformClasses = "translate-x-[-100%]";
                
                if (idx === 0) {
                  // First card: starts large, moves left and shrinks
                  widthClasses = "w-[400px] opacity-100";
                } else if (idx === 1) {
                  // Second card: grows as it moves to first position
                  widthClasses = "w-[400px] opacity-100";
                } else {
                  // Other cards: stay normal size
                  widthClasses = "w-[200px] opacity-100";
                }
              } else {
                // Static position
                if (idx === 0) {
                  // First card: large
                  widthClasses = "w-[400px] opacity-100";
                } else {
                  // Other cards: normal size
                  widthClasses = "w-[200px] opacity-100";
                }
              }
              
              return (
                <div
                  key={`${item.src}-${idx}`}
                  className={`${cardClasses} ${widthClasses} ${transformClasses}`}
                  style={{ 
                    height: '320px',
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ 
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-2xl font-semibold leading-snug mb-2">
                        {item.title}
                      </h3>
                      {item.description && idx === 0 && (
                        <p className="text-white/90 text-lg leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
