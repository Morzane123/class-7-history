"use client";

import { useState, useEffect } from "react";

export default function HomeBackground() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: index === currentImage ? 1 : 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
    </div>
  );
}
