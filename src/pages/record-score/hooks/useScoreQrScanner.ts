import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  captureVideoFrameImageData,
  decodeScoreQrWithJsQR,
  parseScoreQrTokenFromPayload,
} from "../scoreQrCameraScan";

type UseScoreQrScannerOptions = {
  /** When true, camera stream will not start (e.g. token already supplied via URL). */
  scanBlocked: boolean;
  /** Start scanning as soon as the video element is mounted. */
  autoStart: boolean;
  onTokenDetected: (token: string) => void;
};

export function useScoreQrScanner({
  scanBlocked,
  autoStart,
  onTokenDetected,
}: UseScoreQrScannerOptions) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRafRef = useRef<number | null>(null);
  const lastScanAtRef = useRef(0);
  const scannerStartCounterRef = useRef(0);
  const scannerStartCurrentRef = useRef<number | null>(null);
  const cameraToastShownForAttemptRef = useRef(false);
  const autoStartRequestedRef = useRef(false);

  const stopScanner = useCallback(() => {
    if (scanRafRef.current != null) {
      window.cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Invalidate any in-flight or active start token so pending async starts are treated as stale
    scannerStartCurrentRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    if (scanBlocked) return;
    if (!videoRef.current) return;
    if (scannerStartCurrentRef.current !== null) return;

    const startToken = ++scannerStartCounterRef.current;
    scannerStartCurrentRef.current = startToken;

    const showScanAttemptError = (message: string) => {
      if (cameraToastShownForAttemptRef.current) return;
      cameraToastShownForAttemptRef.current = true;
      toast.error(message);
    };

    stopScanner();

    if (typeof navigator === "undefined" || typeof window === "undefined") {
      if (scannerStartCurrentRef.current === startToken) scannerStartCurrentRef.current = null;
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      showScanAttemptError(
        t("recordScorePage.validate.cameraApiUnavailable"),
      );
      if (scannerStartCurrentRef.current === startToken) scannerStartCurrentRef.current = null;
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : "";
      let message: string;
      if (name === "NotAllowedError") {
        message = t("recordScorePage.validate.cameraPermissionDenied");
      } else if (name === "NotFoundError") {
        message = t("recordScorePage.validate.cameraNotFound");
      } else if (name === "NotReadableError") {
        message = t("recordScorePage.validate.cameraInUse");
      } else {
        message =
          getErrorMessage(error) || t("recordScorePage.validate.noCamera");
      }
      showScanAttemptError(message.trim() || t("recordScorePage.validate.noCamera"));
      if (scannerStartCurrentRef.current === startToken) scannerStartCurrentRef.current = null;
      return;
    }

    try {
      // If start was invalidated while awaiting getUserMedia, treat stream as stale.
      if (scannerStartCurrentRef.current !== startToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Play briefly on an offscreen video to ensure the stream can start without mutating
      // the real `videoRef` until we're sure this start is still active.
      const probeVideo = document.createElement("video");
      probeVideo.muted = true;
      probeVideo.playsInline = true;
      probeVideo.srcObject = stream;
      try {
        // this may reject on some platforms; if so, stop stream and surface error below
        // (we'll handle showing toasts in the outer try/catch)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (probeVideo as any).play();
      } catch {
        stream.getTracks().forEach((t) => t.stop());
        if (scannerStartCurrentRef.current === startToken) scannerStartCurrentRef.current = null;
        throw new Error("video-play-failed");
      }

      // Verify still current after the probe play
      if (scannerStartCurrentRef.current !== startToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Now attach to the real video element and start playback there.
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Final check after actual play: if stale, close stream and bail without mutating refs further.
      if (scannerStartCurrentRef.current !== startToken) {
        stream.getTracks().forEach((t) => t.stop());
        // detach from video element if it was set
        if (videoRef.current) videoRef.current.srcObject = null;
        streamRef.current = null;
        return;
      }

      type BarcodeDetectorConstructor =
        (new (options?: {
          formats?: string[];
        }) => {
          detect: (
            source: HTMLVideoElement,
          ) => Promise<Array<{ rawValue?: string }>>;
        }) & {
          getSupportedFormats?: () => Promise<string[]>;
        };

      const useNativeBarcode = "BarcodeDetector" in window;
      const DetectorCtor = useNativeBarcode
        ? (window as unknown as { BarcodeDetector: BarcodeDetectorConstructor })
            .BarcodeDetector
        : null;

      let nativeQrSupported = false;
      if (DetectorCtor && typeof DetectorCtor.getSupportedFormats === "function") {
        try {
          const supported = await DetectorCtor.getSupportedFormats();
          nativeQrSupported =
            Array.isArray(supported) && supported.includes("qr_code");
        } catch {
          nativeQrSupported = false;
        }
      }

      if (nativeQrSupported && DetectorCtor) {
        const detector = new DetectorCtor({ formats: ["qr_code"] });

        const scanLoop = async () => {
          // If this start is no longer the active one, stop scanning here.
          if (scannerStartCurrentRef.current !== startToken) return;
          if (!videoRef.current || !streamRef.current) return;

          const now = Date.now();
          if (now - lastScanAtRef.current < 250) {
            scanRafRef.current = window.requestAnimationFrame(scanLoop);
            return;
          }
          lastScanAtRef.current = now;

          try {
            const detections = await detector.detect(videoRef.current);
            const payload = detections[0]?.rawValue?.trim() ?? "";
            const detectedToken = parseScoreQrTokenFromPayload(payload);

            if (detectedToken) {
              if (scannerStartCurrentRef.current !== startToken) return;
              onTokenDetected(detectedToken);
              stopScanner();
              return;
            }
          } catch {
            // Keep scanning; intermittent detection failures can happen while camera warms up.
          }

          scanRafRef.current = window.requestAnimationFrame(scanLoop);
        };

        scanRafRef.current = window.requestAnimationFrame(scanLoop);
      } else {
        const canvas = document.createElement("canvas");

        const scanLoop = () => {
          // If this start is no longer the active one, stop scanning here.
          if (scannerStartCurrentRef.current !== startToken) return;
          if (!videoRef.current || !streamRef.current) return;
          const video = videoRef.current;

          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            scanRafRef.current = window.requestAnimationFrame(scanLoop);
            return;
          }

          const now = Date.now();
          if (now - lastScanAtRef.current < 250) {
            scanRafRef.current = window.requestAnimationFrame(scanLoop);
            return;
          }
          lastScanAtRef.current = now;

          const imageData = captureVideoFrameImageData(video, canvas);
          if (imageData) {
            const detectedToken = decodeScoreQrWithJsQR(imageData);
            if (detectedToken) {
              if (scannerStartCurrentRef.current !== startToken) return;
              onTokenDetected(detectedToken);
              stopScanner();
              return;
            }
          }

          scanRafRef.current = window.requestAnimationFrame(scanLoop);
        };

        scanRafRef.current = window.requestAnimationFrame(scanLoop);
      }

      // Leave `scannerStartCurrentRef.current` set to `startToken` while scanner is active.
    } catch (error: unknown) {
      stopScanner();
      showScanAttemptError(
        (getErrorMessage(error) || t("recordScorePage.validate.noCamera")).trim() ||
          t("recordScorePage.validate.noCamera"),
      );
      if (scannerStartCurrentRef.current === startToken) scannerStartCurrentRef.current = null;
    }
  }, [onTokenDetected, scanBlocked, stopScanner, t]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (scanBlocked) {
      stopScanner();
    }
  }, [scanBlocked, stopScanner]);

  const videoRefCallback = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (!node || scanBlocked) return;
      if (autoStart && !autoStartRequestedRef.current) {
        autoStartRequestedRef.current = true;
        cameraToastShownForAttemptRef.current = false;
        void startScanner();
      }
    },
    [autoStart, scanBlocked, startScanner],
  );

  const resetCameraToastForRetry = useCallback(() => {
    cameraToastShownForAttemptRef.current = false;
  }, []);

  return {
    videoRefCallback,
    stopScanner,
    startScanner,
    resetCameraToastForRetry,
  };
}
