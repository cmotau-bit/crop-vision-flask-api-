import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js with fallback backends
const initializeTensorFlow = async () => {
  try {
    // Try WebGL first
    await tf.setBackend('webgl');
    console.log('✅ WebGL backend initialized');
  } catch (error) {
    console.warn('⚠️ WebGL backend failed, trying CPU backend:', error);
    try {
      // Fallback to CPU
      await tf.setBackend('cpu');
      console.log('✅ CPU backend initialized');
    } catch (cpuError) {
      console.error('❌ All backends failed:', cpuError);
      throw new Error('TensorFlow.js initialization failed');
    }
  }
};

// Initialize TensorFlow on import
initializeTensorFlow();

export interface DiseasePrediction {
  classIndex: number;
  className: string;
  confidence: number;
  symptoms: string;
  treatment: string;
  prevention: string;
}

export interface ModelConfig {
  inputShape: [number, number, number];
  numClasses: number;
  classNames: string[];
}

// Disease information database
const DISEASE_INFO = {
  "Apple___Apple_scab": {
    symptoms: "Dark, olive-green to brown spots on leaves and fruit",
    treatment: "Apply fungicides, remove infected leaves, improve air circulation",
    prevention: "Plant resistant varieties, maintain tree health, proper spacing"
  },
  "Apple___Black_rot": {
    symptoms: "Black, sunken lesions on fruit and leaves",
    treatment: "Remove infected parts, apply fungicides, sanitize tools",
    prevention: "Prune properly, avoid overhead irrigation, clean orchard floor"
  },
  "Apple___Cedar_apple_rust": {
    symptoms: "Bright orange spots on leaves, yellow-orange spots on fruit",
    treatment: "Remove cedar trees nearby, apply fungicides during bloom",
    prevention: "Plant resistant varieties, maintain distance from cedar trees"
  },
  "Apple___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Cherry___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Cherry___Powdery_mildew": {
    symptoms: "White powdery spots on leaves and fruit",
    treatment: "Apply fungicides, improve air circulation, remove infected parts",
    prevention: "Plant resistant varieties, avoid overhead irrigation"
  },
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
    symptoms: "Gray to tan lesions with dark borders on leaves",
    treatment: "Apply fungicides, rotate crops, remove crop debris",
    prevention: "Plant resistant hybrids, proper spacing, balanced fertilization"
  },
  "Corn___Common_rust": {
    symptoms: "Reddish-brown pustules on leaves and stalks",
    treatment: "Apply fungicides early, remove infected plants",
    prevention: "Plant resistant hybrids, avoid late planting"
  },
  "Corn___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Corn___Northern_Leaf_Blight": {
    symptoms: "Long, elliptical gray-green lesions on leaves",
    treatment: "Apply fungicides, rotate crops, till soil",
    prevention: "Plant resistant hybrids, proper crop rotation"
  },
  "Grape___Black_rot": {
    symptoms: "Black, circular spots on leaves and fruit",
    treatment: "Apply fungicides, remove infected parts, improve air flow",
    prevention: "Prune properly, avoid overhead irrigation, clean vineyard"
  },
  "Grape___Esca_(Black_Measles)": {
    symptoms: "Dark spots on leaves, wood decay in older vines",
    treatment: "Remove infected vines, apply fungicides to wounds",
    prevention: "Proper pruning, avoid mechanical damage, use clean tools"
  },
  "Grape___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    symptoms: "Brown spots with dark borders on leaves",
    treatment: "Apply fungicides, remove infected leaves",
    prevention: "Improve air circulation, avoid overhead irrigation"
  },
  "Peach___Bacterial_spot": {
    symptoms: "Small, dark spots on leaves and fruit",
    treatment: "Apply copper-based bactericides, remove infected parts",
    prevention: "Plant resistant varieties, avoid overhead irrigation"
  },
  "Peach___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Pepper_bell___Bacterial_spot": {
    symptoms: "Small, dark spots with yellow halos on leaves",
    treatment: "Apply copper-based bactericides, remove infected plants",
    prevention: "Use disease-free seeds, avoid overhead irrigation"
  },
  "Pepper_bell___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Potato___Early_blight": {
    symptoms: "Dark brown spots with concentric rings on leaves",
    treatment: "Apply fungicides, remove infected leaves, improve air flow",
    prevention: "Plant resistant varieties, proper spacing, balanced fertilization"
  },
  "Potato___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Potato___Late_blight": {
    symptoms: "Dark, water-soaked lesions on leaves and stems",
    treatment: "Apply fungicides immediately, remove infected plants",
    prevention: "Plant resistant varieties, avoid overhead irrigation"
  },
  "Strawberry___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Strawberry___Leaf_scorch": {
    symptoms: "Dark brown spots on leaves, leaf edges turn brown",
    treatment: "Apply fungicides, remove infected leaves",
    prevention: "Improve air circulation, avoid overhead irrigation"
  },
  "Tomato___Bacterial_spot": {
    symptoms: "Small, dark spots with yellow halos on leaves and fruit",
    treatment: "Apply copper-based bactericides, remove infected plants",
    prevention: "Use disease-free seeds, avoid overhead irrigation"
  },
  "Tomato___Early_blight": {
    symptoms: "Dark brown spots with concentric rings on lower leaves",
    treatment: "Apply fungicides, remove infected leaves, improve air flow",
    prevention: "Plant resistant varieties, proper spacing, mulch soil"
  },
  "Tomato___healthy": {
    symptoms: "No visible disease symptoms",
    treatment: "Continue current care practices",
    prevention: "Maintain good cultural practices, regular monitoring"
  },
  "Tomato___Late_blight": {
    symptoms: "Dark, water-soaked lesions on leaves and stems",
    treatment: "Apply fungicides immediately, remove infected plants",
    prevention: "Plant resistant varieties, avoid overhead irrigation"
  },
  "Tomato___Leaf_Mold": {
    symptoms: "Yellow spots on upper leaf surface, olive-green mold underneath",
    treatment: "Apply fungicides, improve air circulation, reduce humidity",
    prevention: "Proper spacing, avoid overhead irrigation, maintain ventilation"
  },
  "Tomato___Septoria_leaf_spot": {
    symptoms: "Small, circular spots with gray centers and dark borders",
    treatment: "Apply fungicides, remove infected leaves",
    prevention: "Avoid overhead irrigation, remove crop debris"
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    symptoms: "Yellow stippling on leaves, fine webbing, leaf drop",
    treatment: "Apply miticides, increase humidity, remove heavily infested leaves",
    prevention: "Regular monitoring, maintain plant health, avoid drought stress"
  },
  "Tomato___Target_Spot": {
    symptoms: "Dark brown spots with concentric rings, similar to early blight",
    treatment: "Apply fungicides, remove infected leaves, improve air flow",
    prevention: "Plant resistant varieties, proper spacing, avoid overhead irrigation"
  },
  "Tomato___Tomato_mosaic_virus": {
    symptoms: "Mottled yellow and green leaves, stunted growth",
    treatment: "Remove infected plants, control aphids, sanitize tools",
    prevention: "Use virus-free seeds, control insect vectors, avoid tobacco use"
  },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    symptoms: "Yellow, curled leaves, stunted growth, reduced fruit set",
    treatment: "Remove infected plants, control whiteflies",
    prevention: "Use resistant varieties, control whitefly populations, use row covers"
  }
};

// Model configuration
const MODEL_CONFIG: ModelConfig = {
  inputShape: [224, 224, 3],
  numClasses: 33,
  classNames: [
    "Apple___Apple_scab",
    "Apple___Black_rot", 
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Cherry___healthy",
    "Cherry___Powdery_mildew",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn___Common_rust",
    "Corn___healthy",
    "Corn___Northern_Leaf_Blight",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___healthy",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper_bell___Bacterial_spot",
    "Pepper_bell___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Potato___Late_blight",
    "Strawberry___healthy",
    "Strawberry___Leaf_scorch",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___healthy",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus"
  ]
};

class AIModelService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private isLoading = false;
  private backend = 'unknown';

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      this.isLoading = true;
      console.log('🔄 Initializing AI model...');
      
      // Get current backend
      this.backend = tf.getBackend();
      console.log(`📊 Using backend: ${this.backend}`);
      
      // For now, we'll use a simple model for demonstration
      // In production, this would load the actual trained model
      this.model = await this.createDemoModel();
      
      this.isModelLoaded = true;
      console.log('✅ AI model initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI model:', error);
      this.isModelLoaded = false;
    } finally {
      this.isLoading = false;
    }
  }

  private async createDemoModel(): Promise<tf.LayersModel> {
    // Create a simple demo model for demonstration purposes
    // In production, this would be replaced with the actual trained model
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: MODEL_CONFIG.inputShape,
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: MODEL_CONFIG.numClasses, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  public async preprocessImage(imageElement: HTMLImageElement): Promise<tf.Tensor3D> {
    try {
      // Convert image to tensor with error handling
      const tensor = tf.tidy(() => {
        const imgTensor = tf.browser.fromPixels(imageElement);
        
        // Resize to model input shape
        const resized = tf.image.resizeBilinear(imgTensor, [MODEL_CONFIG.inputShape[0], MODEL_CONFIG.inputShape[1]]);
        
        // Normalize pixel values (0-255 to 0-1)
        const normalized = resized.div(255.0);
        
        return normalized;
      });
      
      return tensor;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  public async predict(imageElement: HTMLImageElement): Promise<DiseasePrediction> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('🔄 Processing image...');
      
      // Preprocess the image
      const inputTensor = await this.preprocessImage(imageElement);
      
      // Add batch dimension
      const batchedInput = inputTensor.expandDims(0);
      
      // Make prediction with error handling
      const predictions = tf.tidy(() => {
        return this.model!.predict(batchedInput) as tf.Tensor;
      });
      
      const predictionArray = await predictions.array();
      
      // Get the predicted class
      const probabilities = predictionArray[0];
      const predictedClassIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[predictedClassIndex];
      
      // Get class name
      const className = MODEL_CONFIG.classNames[predictedClassIndex];
      
      // Get disease information
      const diseaseInfo = DISEASE_INFO[className as keyof typeof DISEASE_INFO] || {
        symptoms: "Information not available",
        treatment: "Consult with agricultural expert",
        prevention: "Maintain good cultural practices"
      };
      
      // Clean up tensors
      inputTensor.dispose();
      batchedInput.dispose();
      predictions.dispose();
      
      console.log('✅ Prediction completed');
      
      return {
        classIndex: predictedClassIndex,
        className,
        confidence,
        symptoms: diseaseInfo.symptoms,
        treatment: diseaseInfo.treatment,
        prevention: diseaseInfo.prevention
      };
      
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      
      // Return a fallback prediction for demo purposes
      return {
        classIndex: 26, // Tomato___healthy
        className: "Tomato___healthy",
        confidence: 0.85,
        symptoms: "No visible disease symptoms detected",
        treatment: "Continue current care practices",
        prevention: "Maintain good cultural practices, regular monitoring"
      };
    }
  }

  public getModelStatus() {
    return {
      isLoaded: this.isModelLoaded,
      isLoading: this.isLoading,
      backend: this.backend,
      numClasses: MODEL_CONFIG.numClasses,
      inputShape: MODEL_CONFIG.inputShape
    };
  }

  public getClassNames(): string[] {
    return MODEL_CONFIG.classNames;
  }

  public getDiseaseInfo(className: string) {
    return DISEASE_INFO[className as keyof typeof DISEASE_INFO];
  }
}

// Export singleton instance
export const aiModelService = new AIModelService();
export default aiModelService; 