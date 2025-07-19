'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  const demoImages = [
    "/gallery/personalized-learning.png",
    "/gallery/real-mentors.png",
    "/gallery/growth-career.png",
    "/gallery/insights-support.png",
    "/gallery/personalized-learning.png",
    "/gallery/real-mentors.png",
  ];

  // We'll pick 2 images per column, cycling through demoImages
  const imagesPerColumn = 2;

  const [startOffsets, setStartOffsets] = useState<number[] | null>(null);

  useEffect(() => {
    // Random start offset between 0 and height of one pill (say 360px)
    const offsets = Array(3).fill(0).map(() => Math.random() * 360);
    setStartOffsets(offsets);
  }, []);

  if (!startOffsets) return null; // wait for client render

  return (
    <section id="home" className="relative bg-white overflow-hidden py-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 items-start gap-8">
        {/* Left text column */}
        <div className="md:col-span-7 text-left">
          <h1 className="text-5xl font-normal text-black mb-12 leading-snug">
            Empowering Students
            <br />
            with Personalized
            <br />
            Mentorship
            <BookOpenIcon className="w-12 h-12 inline-block align-text-bottom ml-2 text-black" />
          </h1>
          <p className="text-xl text-black mt-8 mb-8 max-w-lg">
            EduVibe connects students with experienced mentors to guide them through their academic journey.
          </p>
          <Button
            size="lg"
            className="bg-black text-white px-6 py-3 text-lg sm:text-xl font-semibold rounded-lg"
          >
            Get Started
          </Button>
        </div>

        {/* Right vertical slider with 3 columns */}
        <div className="md:col-span-5 relative flex justify-center space-x-4">
          {[0, 1, 2].map((colIndex) => {
            // Pick images for this column (cycled)
            const columnImages = [];
            for(let i = 0; i < imagesPerColumn; i++) {
              const imgIndex = (colIndex * imagesPerColumn + i) % demoImages.length;
              columnImages.push(demoImages[imgIndex]);
            }

            return (
              <div key={colIndex} className="relative w-20 h-[360px] overflow-hidden">
                <div
                  className="absolute animate-slide-vertical-down space-y-8"
                  style={{
                    top: `-${startOffsets[colIndex]}px`,
                    animationDelay: `${colIndex * 2}s`,
                  }}
                >
                  {columnImages.map((src, i) => (
                    <div
                      key={i}
                      className="w-20 h-72 bg-gray-100 overflow-hidden rounded-[999px] border border-gray-300"
                    >
                      <Image
                        src={src}
                        alt={`Demo ${colIndex * imagesPerColumn + i + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-[999px]"
                      />
                    </div>
                  ))}
                  {/* Duplicate images for infinite seamless scroll */}
                  {columnImages.map((src, i) => (
                    <div
                      key={`dup-${i}`}
                      className="w-20 h-72 bg-gray-100 overflow-hidden rounded-[999px] border border-gray-300"
                    >
                      <Image
                        src={src}
                        alt={`Demo duplicate ${colIndex * imagesPerColumn + i + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-[999px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom fade overlay */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <style jsx global>{`
        @keyframes slideVerticalDown {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(360px); /* height of one pill * 2 images + margin */
          }
        }
        .animate-slide-vertical-down {
          animation: slideVerticalDown 12s linear infinite;
        }
      `}</style>
    </section>
  );
}
