
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const History = () => {
  const navigate = useNavigate();

  // Mock history data
  const historyData = [
    {
      id: 1,
      date: "2024-01-15",
      time: "14:30",
      crop: "Tomato",
      disease: "Late Blight",
      severity: "Medium",
      status: "Treated",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      date: "2024-01-12",
      time: "09:15",
      crop: "Wheat",
      disease: "Rust",
      severity: "Low",
      status: "Monitoring",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      date: "2024-01-10",
      time: "16:45",
      crop: "Corn",
      disease: "Healthy",
      severity: "None",
      status: "Healthy",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      date: "2024-01-08",
      time: "11:20",
      crop: "Rice",
      disease: "Bacterial Blight",
      severity: "High",
      status: "Treated",
      image: "/placeholder.svg"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'treated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'none': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'monitoring': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'treated': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
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
            <h1 className="text-xl font-bold text-green-800">Scan History</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{historyData.length}</div>
              <div className="text-xs text-gray-600">Total Scans</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {historyData.filter(item => item.status === 'Monitoring').length}
              </div>
              <div className="text-xs text-gray-600">Monitoring</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {historyData.filter(item => item.status === 'Healthy').length}
              </div>
              <div className="text-xs text-gray-600">Healthy</div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Scans</h2>
          
          {historyData.map((item) => (
            <Card key={item.id} className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="h-6 w-6 text-gray-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 truncate">{item.crop}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium text-gray-700">{item.disease}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{item.date} at {item.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status}
                        </Badge>
                        {item.severity !== 'None' && (
                          <Badge className={getSeverityColor(item.severity)} variant="secondary">
                            {item.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            onClick={() => navigate("/camera")}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Camera className="mr-3 h-6 w-6" />
            New Scan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default History;
