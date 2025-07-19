"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    alt: "Team collaboration",
    title: "Team Collaboration",
    description: "Working together towards success"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=500&fit=crop",
    alt: "Mentorship session",
    title: "Mentorship Session",
    description: "One-on-one guidance and support"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop",
    alt: "Learning environment",
    title: "Learning Environment",
    description: "Creating the perfect space for growth"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    alt: "Professional development",
    title: "Professional Development",
    description: "Building skills for the future"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop",
    alt: "Workshop session",
    title: "Workshop Session",
    description: "Interactive learning experiences"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop",
    alt: "Success celebration",
    title: "Success Celebration",
    description: "Celebrating achievements together"
  }
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Community in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our mentors and mentees are transforming lives through meaningful connections and shared learning experiences.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryImages.map((image) => (
            <Card 
              key={image.id} 
              className="break-inside-avoid cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden group"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                  <div className="p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                    <p className="text-sm opacity-90">{image.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h3 className="text-white text-xl font-semibold mb-2">{selectedImage.title}</h3>
                <p className="text-white opacity-90">{selectedImage.description}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 