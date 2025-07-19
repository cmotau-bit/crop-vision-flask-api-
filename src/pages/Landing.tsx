import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Landing: React.FC = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 30000); // 30 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 shadow-xl border-0 flex flex-col items-center py-12 px-4">
        <CardContent className="flex flex-col items-center justify-center p-0">
          <img
            src="/CropCareAIlogo.png"
            alt="CropCare AI Logo"
            className="rounded-2xl shadow-lg bg-white"
            style={{
              opacity: fadeIn ? 1 : 0,
              transition: "opacity 30s cubic-bezier(0.4, 0, 0.2, 1)",
              width: "min(70vw, 180px)",
              height: "auto",
              maxHeight: 180,
              display: "block"
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing; 