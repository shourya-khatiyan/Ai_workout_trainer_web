import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let initializedDetector: poseDetection.PoseDetector | null = null;

/**
 * tries webgpu first, then webgl, then wasm as the tf backend.
 * returns the name of the backend that was selected.
 */
async function initBackend(): Promise<string> {
  const backends = ['webgl', 'wasm', 'cpu'];
  for (const backend of backends) {
    try {
      await tf.setBackend(backend);
      await tf.ready();
      return backend;
    } catch {
      console.warn(`tf backend "${backend}" unavailable, trying next...`);
    }
  }
  throw new Error('no tensorflow backend available');
}

/**
 * creates and caches a movenet pose detector singleton.
 * warms up the model with a dummy tensor to avoid first-frame lag.
 */
export const initializeDetector = async (): Promise<poseDetection.PoseDetector> => {
  if (initializedDetector) return initializedDetector;

  await initBackend();

  initializedDetector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    }
  );

  const dummyTensor = tf.zeros([256, 256, 3]) as tf.Tensor3D;
  await initializedDetector.estimatePoses(dummyTensor);
  dummyTensor.dispose();

  return initializedDetector;
};

/**
 * disposes the cached detector and frees gpu memory.
 */
export const disposeDetector = (): void => {
  if (initializedDetector) {
    initializedDetector.dispose?.();
    initializedDetector = null;
  }
};
