import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let initializedDetector: poseDetection.PoseDetector | null = null;

export const initializeDetector = async (): Promise<poseDetection.PoseDetector> => {
  if (initializedDetector) return initializedDetector;

  await tf.setBackend('webgl');
  await tf.ready();
  
  initializedDetector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true
    }
  );
  
  // Warm up with dummy tensor
  const dummyTensor = tf.zeros([256, 256, 3]) as tf.Tensor3D;
  await initializedDetector.estimatePoses(dummyTensor);
  dummyTensor.dispose();
  
  return initializedDetector;
};

export const disposeDetector = (): void => {
  if (initializedDetector) {
    initializedDetector.dispose?.();
    initializedDetector = null;
  }
};
