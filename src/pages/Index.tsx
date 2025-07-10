
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, History, Leaf, Smartphone, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">CropCare AI</h1>
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
          <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Smart Detection</h3>
                  <p className="text-sm text-gray-600">AI analyzes your crop photos instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Treatment Plans</h3>
                  <p className="text-sm text-gray-600">Get actionable treatment recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <History className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Track History</h3>
                  <p className="text-sm text-gray-600">Monitor crop health over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
