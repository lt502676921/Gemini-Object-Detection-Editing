"use client";

import { useState } from "react";
import ImageShowcase from "@/components/ImageShowcase";
import ObjectDetectionTest from "@/components/ObjectDetectionTest";
import Navbar from "@/components/Navbar";
import { ConfigProvider } from "@/components/ConfigContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"gallery" | "detection">("gallery");

  return (
    <ConfigProvider>
      <main className="min-h-screen bg-zinc-950">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="pt-24">
          {activeTab === "gallery" ? <ImageShowcase /> : <ObjectDetectionTest />}
        </div>
        
        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </main>
    </ConfigProvider>
  );
}
