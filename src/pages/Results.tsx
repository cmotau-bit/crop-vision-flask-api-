
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Leaf, Droplets, Calendar, Camera, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStorage } from "@/hooks/use-storage";
import { DiseasePrediction } from "@/lib/ai-model";

interface LocationState {
  prediction: DiseasePrediction;
  imageData: string;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveScan } = useStorage();

  // Get prediction data from navigation state
  const state = location.state as LocationState;
  const prediction = state?.prediction;
  const imageData = state?.imageData;

  // Fallback to mock data if no real prediction
  const result = prediction ? {
    disease: prediction.className.split('___')[1] || prediction.className,
    confidence: Math.round(prediction.confidence * 100),
    severity: prediction.confidence > 0.8 ? "High" : prediction.confidence > 0.6 ? "Medium" : "Low",
    status: prediction.className.includes('healthy') ? "Healthy" : "Disease Detected",
    recommendations: prediction.treatment.split('. ').filter(Boolean),
    preventiveMeasures: prediction.prevention.split('. ').filter(Boolean),
    symptoms: prediction.symptoms
  } : {
    disease: "Tomato Late Blight",
    confidence: 87,
    severity: "Medium",
    status: "Disease Detected",
    recommendations: [
      "Remove affected leaves immediately",
      "Apply copper-based fungicide",
      "Improve air circulation around plants",
      "Avoid overhead watering",
      "Monitor daily for spread"
    ],
    preventiveMeasures: [
      "Plant resistant varieties",
      "Ensure proper spacing",
      "Water at soil level",
      "Remove plant debris"
    ],
    symptoms: "Dark, water-soaked lesions on leaves and stems"
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "Healthy") {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "Healthy") {
      return "bg-green-100";
    }
    return "bg-red-100";
  };

  const handleSaveToHistory = async () => {
    if (prediction && imageData) {
      try {
        await saveScan({
          imageData,
          prediction: {
            className: prediction.className,
            confidence: prediction.confidence,
            symptoms: prediction.symptoms,
            treatment: prediction.treatment,
            prevention: prediction.prevention
          }
        });
        
        // Show success message
        alert("Scan saved to history!");
      } catch (error) {
        console.error('Failed to save scan:', error);
        alert("Failed to save scan to history");
      }
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
              onClick={() => navigate("/camera")}
              className="text-green-700 hover:bg-green-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-green-800">Analysis Results</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Captured Image */}
        {imageData && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
            <CardContent className="p-0">
              <img
                src={imageData}
                alt="Analyzed crop"
                className="w-full h-48 object-cover"
              />
            </CardContent>
          </Card>
        )}

        {/* Result Overview */}
        <Card className={`bg-white/70 backdrop-blur-sm ${getStatusColor(result.status)}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${getStatusColor(result.status)} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {getStatusIcon(result.status)}
            </div>
            <CardTitle className="text-2xl text-gray-800">{result.disease}</CardTitle>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Badge className={getSeverityColor(result.severity)}>
                {result.severity} Severity
              </Badge>
              <Badge variant="outline" className="border-green-300 text-green-700">
                {result.confidence}% Confidence
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Symptoms */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{result.symptoms}</p>
          </CardContent>
        </Card>

        {/* Immediate Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Immediate Treatment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prevention */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              Prevention Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.preventiveMeasures.map((measure, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{measure}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Follow-up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 1-3: Apply treatment</p>
                <p className="text-xs text-gray-600">Follow immediate treatment steps</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 7: Monitor progress</p>
                <p className="text-xs text-gray-600">Take new photos to track improvement</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 14: Reassess</p>
                <p className="text-xs text-gray-600">Evaluate treatment effectiveness</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        {prediction && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                AI Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="text-gray-800">MobileNetV2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Time:</span>
                <span className="text-gray-800">~2 seconds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offline Capable:</span>
                <span className="text-green-600">✓ Yes</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/camera")}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Camera className="mr-3 h-6 w-6" />
            Scan Another Crop
          </Button>
          
          {prediction && (
            <Button
              onClick={handleSaveToHistory}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50 py-6 text-lg rounded-xl font-semibold transition-all duration-300"
            >
              Save to History
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
