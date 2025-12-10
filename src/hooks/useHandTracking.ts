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

const PINCH_THRESHOLD = 0.05;
const FIST_THRESHOLD = 0.08;

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

  const calculateGesture = useCallback((handLandmarks: HandLandmark[]): GestureState => {
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const middleTip = handLandmarks[12];
    const ringTip = handLandmarks[16];
    const pinkyTip = handLandmarks[20];
    const wrist = handLandmarks[0];
    const indexMcp = handLandmarks[5];
    const pinkyMcp = handLandmarks[17];

    // Palm center calculation
    const palmX = (wrist.x + indexMcp.x + pinkyMcp.x) / 3;
    const palmY = (wrist.y + indexMcp.y + pinkyMcp.y) / 3;
    const palmPosition = { x: palmX, y: palmY };

    // Pinch detection (thumb to index distance)
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2) +
      Math.pow(thumbTip.z - indexTip.z, 2)
    );
    const isPinching = pinchDistance < PINCH_THRESHOLD;

    // Fist detection (all fingertips close to palm)
    const fingerDistances = [indexTip, middleTip, ringTip, pinkyTip].map(tip =>
      Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) +
        Math.pow(tip.y - wrist.y, 2)
      )
    );
    const avgFingerDistance = fingerDistances.reduce((a, b) => a + b, 0) / 4;
    const isFist = avgFingerDistance < FIST_THRESHOLD;

    // Open hand detection (fingers spread)
    const isOpenHand = avgFingerDistance > 0.15 && !isPinching;

    // Calculate rotation based on palm movement
    let rotation = { x: 0, y: 0 };
    if (prevPalmPosition.current && !isPinching) {
      const deltaX = (palmPosition.x - prevPalmPosition.current.x) * 5;
      const deltaY = (palmPosition.y - prevPalmPosition.current.y) * 5;
      rotation = { x: deltaY, y: -deltaX };
    }
    prevPalmPosition.current = palmPosition;

    return {
      isPinching,
      isOpenHand,
      isFist,
      palmPosition,
      pinchDistance,
      rotation,
    };
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

          // Draw landmarks
          ctx.fillStyle = 'hsl(180, 100%, 50%)';
          ctx.strokeStyle = 'hsl(180, 100%, 50%)';
          ctx.lineWidth = 2;

          // Draw connections
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // index
            [0, 9], [9, 10], [10, 11], [11, 12], // middle
            [0, 13], [13, 14], [14, 15], [15, 16], // ring
            [0, 17], [17, 18], [18, 19], [19, 20], // pinky
            [5, 9], [9, 13], [13, 17], // palm
          ];

          connections.forEach(([start, end]) => {
            const startPoint = handLandmarks[start];
            const endPoint = handLandmarks[end];
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
            ctx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
            ctx.stroke();
          });

          // Draw points
          handLandmarks.forEach((landmark, index) => {
            const x = landmark.x * canvasRef.current!.width;
            const y = landmark.y * canvasRef.current!.height;
            
            ctx.beginPath();
            ctx.arc(x, y, index === 4 || index === 8 ? 8 : 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Highlight thumb and index for pinch
            if (index === 4 || index === 8) {
              ctx.strokeStyle = gestureState.isPinching ? 'hsl(300, 100%, 60%)' : 'hsl(180, 100%, 50%)';
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          });
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
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
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
