
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera as CameraIcon, ArrowLeft, Upload, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Camera = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    navigate("/results");
  };

  const handleRetake = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-green-700 hover:bg-green-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-green-800">Crop Analysis</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Camera Interface */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
          <CardContent className="p-0">
            {!selectedImage ? (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CameraIcon className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Take a Photo</h3>
                <p className="text-sm text-gray-500 text-center px-8">
                  Capture a clear image of the affected crop area
                </p>
              </div>
            ) : (
              <div className="aspect-square relative">
                <img
                  src={selectedImage}
                  alt="Selected crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRetake}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Photography Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Ensure good lighting conditions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Focus on the affected area</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Keep the camera steady</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Fill the frame with the crop</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!selectedImage ? (
            <>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CameraIcon className="mr-3 h-6 w-6" />
                Take Photo
              </Button>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="gallery-upload"
              />
              <Button
                onClick={() => document.getElementById('gallery-upload')?.click()}
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50 py-6 text-lg rounded-xl font-semibold transition-all duration-300"
              >
                <Upload className="mr-3 h-6 w-6" />
                Upload from Gallery
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-3 h-6 w-6" />
                  Analyze Crop
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
