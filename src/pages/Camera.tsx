
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, RotateCcw, CheckCircle, AlertTriangle, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useStorage } from "@/hooks/use-storage";
import aiModelService from "@/lib/ai-model";

const Camera = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>('Loading...');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Storage hook
  const { saveScan, isInitialized: storageInitialized } = useStorage();

  // Simple hash function to identify unique images
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Check model status on mount
  useEffect(() => {
    const checkModelStatus = () => {
      const status = aiModelService.getModelStatus();
      if (status.isLoaded) {
        setModelStatus('Ready');
      } else if (status.isLoading) {
        setModelStatus('Loading AI Model...');
      } else {
        setModelStatus('AI Model Error');
      }
    };

    checkModelStatus();
    const interval = setInterval(checkModelStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('📁 Uploading image:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setCapturedImage(result);
            console.log('✅ Image uploaded successfully');
            toast({
              title: "Image uploaded",
              description: "Image ready for analysis",
            });
          }
        };
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('❌ Upload failed:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!aiModelService.getModelStatus().isLoaded) {
      toast({
        title: "AI Model not ready",
        description: "Please wait for the AI model to load",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔄 Starting analysis for image...');
      console.log('📊 Image data length:', capturedImage.length);
      console.log('🆔 Image hash:', hashCode(capturedImage));
      
      // Create image element for analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          console.log('🤖 Starting AI prediction at:', new Date().toISOString());
          let prediction;
          try {
            prediction = await aiModelService.predict(img);
            
            // Debug: Check if treatment info is available
            console.log('🔍 Prediction result:', {
              className: prediction.className,
              confidence: prediction.confidence,
              hasTreatment: !!prediction.treatment,
              hasPrevention: !!prediction.prevention,
              hasSymptoms: !!prediction.symptoms,
              treatmentLength: prediction.treatment?.length || 0,
              timestamp: new Date().toISOString()
            });
            
            // Check disease info status
            const diseaseStatus = aiModelService.getDiseaseInfoStatus();
            console.log('🔍 Disease info status:', diseaseStatus);
            
          } catch (aiError) {
            console.warn('AI prediction failed, using fallback:', aiError);
            
            // Fallback prediction for demo purposes
            prediction = {
              classIndex: 26, // Tomato___healthy
              className: "Tomato___healthy",
              confidence: 0.85,
              symptoms: "No visible disease symptoms detected",
              treatment: "Continue current care practices",
              prevention: "Maintain good cultural practices, regular monitoring"
            };
            
            toast({
              title: "Demo Mode",
              description: "Using demo prediction due to AI model issues",
              variant: "default",
            });
          }
          
          // Save to storage if available
          if (storageInitialized) {
            try {
              await saveScan({
                imageData: capturedImage,
                prediction: {
                  className: prediction.className,
                  confidence: prediction.confidence,
                  symptoms: prediction.symptoms,
                  treatment: prediction.treatment,
                  prevention: prediction.prevention
                }
              });
            } catch (storageError) {
              console.warn('Failed to save scan:', storageError);
            }
          }

          // Navigate to results with prediction data
          navigate("/results", { 
            state: { 
              prediction,
              imageData: capturedImage 
            } 
          });
          
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: "Failed to analyze image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };

      img.onerror = () => {
        toast({
          title: "Image error",
          description: "Failed to load image for analysis",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      };

      img.src = capturedImage;
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Handle retake
  const handleRetake = () => {
    setCapturedImage(null);
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
        {/* Model Status */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">AI Model Status:</span>
                <div className="flex items-center space-x-2">
                  {modelStatus === 'Ready' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : modelStatus === 'Loading AI Model...' ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    modelStatus === 'Ready' ? 'text-green-600' : 
                    modelStatus === 'Loading AI Model...' ? 'text-blue-600' : 
                    'text-red-600'
                  }`}>
                    {modelStatus}
                  </span>
                </div>
              </div>
              {aiModelService.getModelStatus().backend && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Backend:</span>
                  <span className="text-xs text-gray-600 font-mono">
                    {aiModelService.getModelStatus().backend}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Interface */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
          <CardContent className="p-0">
            {!capturedImage ? (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
                {/* Upload Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                  <div className="w-24 h-24 bg-green-100/80 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Select Image from Gallery
                  </h3>
                  <p className="text-sm text-gray-600 text-center px-8">
                    Choose an image from your gallery to analyze
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-square relative">
                <img
                  src={capturedImage}
                  alt="Uploaded crop"
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
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Image Requirements</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Clear, well-lit image of the crop</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Focus on the affected area</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Good resolution (minimum 224x224 pixels)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Supported formats: JPG, PNG, WebP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!capturedImage ? (
            <>
              {/* Gallery Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                <Upload className="mr-3 h-6 w-6" />
                Select Image from Gallery
              </label>
            </>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !aiModelService.getModelStatus().isLoaded}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
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
