
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, History, Leaf, Smartphone, Shield, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallButton(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2 relative">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">CropCare AI</h1>
            
            {/* Floating Install Button */}
            {showInstallButton && (
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="absolute right-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className={`text-center space-y-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Smartphone className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-yellow-800" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Detect Crop Diseases</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Take a photo of your crops and get instant AI-powered disease detection with treatment recommendations
          </p>
        </div>

        {/* Features */}
        <div className={`grid grid-cols-1 gap-4 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* All feature cards removed */}
        </div>

        {/* Action Buttons */}
        <div className={`space-y-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/camera">
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Camera className="mr-3 h-6 w-6" />
              Start Detection
            </Button>
          </Link>

          <Link to="/history">
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 py-6 text-lg rounded-xl font-semibold transition-all duration-300">
              <History className="mr-3 h-6 w-6" />
              View History
            </Button>
          </Link>

          {/* Install App Button */}
          {showInstallButton && (
            <Button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="mr-3 h-5 w-5" />
              Install App
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className={`text-center pt-8 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-sm text-gray-500">
            Powered by AI • Trusted by farmers worldwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
