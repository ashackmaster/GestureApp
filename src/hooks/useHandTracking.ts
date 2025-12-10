import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureState {
  isPinching: boolean;
  isOpenHand: boolean;
  isFist: boolean;
  palmPosition: { x: number; y: number } | null;
  pinchDistance: number;
  rotation: { x: number; y: number };
}

const PINCH_THRESHOLD = 0.06;
const FIST_THRESHOLD = 0.1;
const SMOOTHING_FACTOR = 0.3;

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
  const [gesture, setGesture] = useState<GestureState>({
    isPinching: false,
    isOpenHand: false,
    isFist: false,
    palmPosition: null,
    pinchDistance: 0,
    rotation: { x: 0, y: 0 },
  });

  const prevPalmPosition = useRef<{ x: number; y: number } | null>(null);
  const smoothedGesture = useRef<GestureState>({
    isPinching: false,
    isOpenHand: false,
    isFist: false,
    palmPosition: null,
    pinchDistance: 0,
    rotation: { x: 0, y: 0 },
  });

  const calculateGesture = useCallback((handLandmarks: HandLandmark[]): GestureState => {
    const thumbTip = handLandmarks[4];
    const thumbIp = handLandmarks[3];
    const indexTip = handLandmarks[8];
    const indexPip = handLandmarks[6];
    const middleTip = handLandmarks[12];
    const middlePip = handLandmarks[10];
    const ringTip = handLandmarks[16];
    const ringPip = handLandmarks[14];
    const pinkyTip = handLandmarks[20];
    const pinkyPip = handLandmarks[18];
    const wrist = handLandmarks[0];
    const indexMcp = handLandmarks[5];
    const middleMcp = handLandmarks[9];
    const pinkyMcp = handLandmarks[17];

    // Palm center calculation (improved)
    const palmX = (wrist.x + indexMcp.x + middleMcp.x + pinkyMcp.x) / 4;
    const palmY = (wrist.y + indexMcp.y + middleMcp.y + pinkyMcp.y) / 4;
    const palmPosition = { x: palmX, y: palmY };

    // Pinch detection (thumb to index distance) - improved with 3D distance
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2) +
      Math.pow((thumbTip.z - indexTip.z) * 0.5, 2)
    );
    const isPinching = pinchDistance < PINCH_THRESHOLD;

    // Improved finger curl detection
    const isFingerCurled = (tip: HandLandmark, pip: HandLandmark, mcp: HandLandmark) => {
      const tipToWrist = Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)
      );
      const pipToWrist = Math.sqrt(
        Math.pow(pip.x - wrist.x, 2) + Math.pow(pip.y - wrist.y, 2)
      );
      return tipToWrist < pipToWrist * 1.1;
    };

    const indexCurled = isFingerCurled(indexTip, indexPip, indexMcp);
    const middleCurled = isFingerCurled(middleTip, middlePip, middleMcp);
    const ringCurled = isFingerCurled(ringTip, ringPip, handLandmarks[13]);
    const pinkyCurled = isFingerCurled(pinkyTip, pinkyPip, pinkyMcp);

    // Fist detection - all fingers curled
    const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;
    const isFist = curledCount >= 3 && !isPinching;

    // Open hand detection - fingers extended
    const fingerDistances = [indexTip, middleTip, ringTip, pinkyTip].map(tip =>
      Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) +
        Math.pow(tip.y - wrist.y, 2)
      )
    );
    const avgFingerDistance = fingerDistances.reduce((a, b) => a + b, 0) / 4;
    const isOpenHand = avgFingerDistance > 0.18 && curledCount <= 1 && !isPinching;

    // Calculate rotation based on palm movement with smoothing
    let rotation = { x: 0, y: 0 };
    if (prevPalmPosition.current && isOpenHand) {
      const deltaX = (palmPosition.x - prevPalmPosition.current.x) * 8;
      const deltaY = (palmPosition.y - prevPalmPosition.current.y) * 8;
      rotation = { 
        x: deltaY * SMOOTHING_FACTOR + smoothedGesture.current.rotation.x * (1 - SMOOTHING_FACTOR),
        y: -deltaX * SMOOTHING_FACTOR + smoothedGesture.current.rotation.y * (1 - SMOOTHING_FACTOR)
      };
    }
    prevPalmPosition.current = palmPosition;

    const newGesture = {
      isPinching,
      isOpenHand,
      isFist,
      palmPosition,
      pinchDistance,
      rotation,
    };

    smoothedGesture.current = newGesture;
    return newGesture;
  }, []);

  const onResults = useCallback((results: Results) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const handLandmarks = results.multiHandLandmarks[0];
          setLandmarks(handLandmarks as HandLandmark[]);
          
          const gestureState = calculateGesture(handLandmarks as HandLandmark[]);
          setGesture(gestureState);

          // Enhanced drawing with glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = gestureState.isPinching ? '#ff00ff' : '#00ffff';
          ctx.strokeStyle = gestureState.isPinching ? 'hsl(300, 100%, 60%)' : 'hsl(180, 100%, 50%)';
          ctx.lineWidth = 2;

          // Draw connections with gradient
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17],
          ];

          connections.forEach(([start, end]) => {
            const startPoint = handLandmarks[start];
            const endPoint = handLandmarks[end];
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
            ctx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
            ctx.stroke();
          });

          // Draw points with enhanced styling
          ctx.shadowBlur = 20;
          handLandmarks.forEach((landmark, index) => {
            const x = landmark.x * canvasRef.current!.width;
            const y = landmark.y * canvasRef.current!.height;
            
            // Larger points for fingertips
            const isFingertip = [4, 8, 12, 16, 20].includes(index);
            const isPinchPoint = index === 4 || index === 8;
            
            ctx.beginPath();
            ctx.arc(x, y, isFingertip ? 6 : 3, 0, 2 * Math.PI);
            
            if (isPinchPoint) {
              ctx.fillStyle = gestureState.isPinching ? '#ff00ff' : '#00ffff';
              ctx.shadowColor = gestureState.isPinching ? '#ff00ff' : '#00ffff';
            } else {
              ctx.fillStyle = '#00ffff';
              ctx.shadowColor = '#00ffff';
            }
            ctx.fill();
          });

          // Draw pinch line when pinching
          if (gestureState.isPinching) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(handLandmarks[4].x * canvasRef.current!.width, handLandmarks[4].y * canvasRef.current!.height);
            ctx.lineTo(handLandmarks[8].x * canvasRef.current!.width, handLandmarks[8].y * canvasRef.current!.height);
            ctx.stroke();
          }
        } else {
          setLandmarks(null);
          setGesture({
            isPinching: false,
            isOpenHand: false,
            isFist: false,
            palmPosition: null,
            pinchDistance: 0,
            rotation: { x: 0, y: 0 },
          });
        }
      }
    }
  }, [calculateGesture]);

  const startTracking = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsLoading(true);

    try {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;
      await camera.start();
      
      setIsTracking(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to start hand tracking:', error);
      setIsLoading(false);
    }
  }, [onResults]);

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsTracking(false);
    setLandmarks(null);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    videoRef,
    canvasRef,
    isTracking,
    isLoading,
    landmarks,
    gesture,
    startTracking,
    stopTracking,
  };
};
