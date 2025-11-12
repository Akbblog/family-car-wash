'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// List your images here
const images = [
  '/images/heroImg.jpg',
  '/images/ExteriorWash.jpg',
  '/images/InteriorDetailing.jpg',
  '/images/WheelCleaning.jpg',
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set up an interval to change the image
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
      
      {/* Map over the images to create the slides */}
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Car detailing slide ${index + 1}`}
          fill
          priority={index === 0} // Only prioritize the first image
          className={`
            object-cover
            transition-all ease-in-out
            ${/* --- THIS IS THE ZOOM EFFECT --- */''}
            ${index === currentIndex ? 'opacity-100 duration-[1000ms]' : 'opacity-0 duration-[1000ms]'}
           
          `}
          sizes="(max-width: 1024px) 100vw, 500px"
        />
      ))}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10"></div>
      
      {/* --- DOTS REMOVED --- */}
      {/* The dots that were here have been deleted */}

    </div>
  );
}
