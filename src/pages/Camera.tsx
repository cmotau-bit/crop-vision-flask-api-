
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera as CameraIcon, ArrowLeft, Upload, RotateCcw, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";
import { useStorage } from "@/hooks/use-storage";
import aiModelService from "@/lib/ai-model";

const Camera = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>('Loading...');

  // Camera hook
  const {
    isStreaming,
    isCapturing,
    hasPermission,
    error: cameraError,
    capturedImage,
    startCamera,
    stopCamera,
    captureImage,
    uploadImage,
    resetCamera,
    videoRef,
    canvasRef
  } = useCamera();

  // Storage hook
  const { saveScan, isInitialized: storageInitialized } = useStorage();

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
        await uploadImage(file);
        toast({
          title: "Image uploaded",
          description: "Image ready for analysis",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      const imageData = await captureImage();
      if (imageData) {
        toast({
          title: "Photo captured",
          description: "Image ready for analysis",
        });
      }
    } catch (error) {
      toast({
        title: "Capture failed",
        description: "Failed to capture photo",
        variant: "destructive",
      });
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast({
        title: "No image selected",
        description: "Please capture or upload an image to analyze",
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
      // Create image element for analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          // Run AI prediction with error handling
          let prediction;
          try {
            prediction = await aiModelService.predict(img);
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
    resetCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

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

        {/* Camera Interface */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
          <CardContent className="p-0">
            {!capturedImage ? (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
                {/* Camera Stream */}
                {isStreaming && (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                
                {/* Camera Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                  <div className="w-24 h-24 bg-green-100/80 rounded-full flex items-center justify-center mb-4">
                    <CameraIcon className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">
                    {isStreaming ? 'Camera Ready' : 'Take a Photo'}
                  </h3>
                  <p className="text-sm text-white/90 text-center px-8 drop-shadow-lg">
                    {isStreaming 
                      ? 'Tap capture to take a photo' 
                      : 'Capture a clear image of the affected crop area'
                    }
                  </p>
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="aspect-square relative">
                <img
                  src={capturedImage}
                  alt="Captured crop"
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

        {/* Camera Error */}
        {cameraError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{cameraError}</span>
              </div>
            </CardContent>
          </Card>
        )}

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
          {!capturedImage ? (
            <>
              {/* Camera Capture Button */}
              <Button
                onClick={handleCameraCapture}
                disabled={!isStreaming || isCapturing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <CameraIcon className="mr-3 h-6 w-6" />
                    Take Photo
                  </>
                )}
              </Button>
              
              {/* Gallery Upload */}
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
