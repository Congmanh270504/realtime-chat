"use client";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="relative h-full">
        <Image
          src="/twice.png"
          fill
          alt="Mountain landscape background"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 flex items-center justify-start z-10">
          <div className="text-left text-white max-w-3xl px-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Where Ideas Learn to Breathe
            </h1>
            <p className="text-sm md:text-base leading-relaxed mb-8">
              A landing space for bold experiments, half-finished thoughts, and
              sparks of inspiration. Built to grow, adapt, and surprise—just
              like the projects you&apos;re about to launch.
            </p>
            <button className="px-4 py-2 border-2 border-white bg-transparent text-white text-sm transition-all duration-300 hover:bg-white hover:text-black cursor-pointer">
              GET STARTED
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
