import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScannerStatus = "idle" | "starting" | "scanning" | "stopping";
type CameraError = "errCam" | "errPermission" | "errMissing" | "errBusy" | "errUnsupported";

function cameraError(error: unknown): CameraError {
  const name = typeof error === "object" && error !== null && "name" in error
    ? String(error.name)
    : String(error);
  if (/NotAllowedError|PermissionDeniedError|SecurityError/.test(name)) return "errPermission";
  if (/NotFoundError|DevicesNotFoundError/.test(name)) return "errMissing";
  if (/NotReadableError|TrackStartError/.test(name)) return "errBusy";
  return "errCam";
}

export function useQrScanner(elementId: string, onDecoded?: (value: string) => void) {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);
  const decodedRef = useRef(false);
  const startTaskRef = useRef<Promise<void> | null>(null);
  const stopTaskRef = useRef<Promise<void> | null>(null);
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;

  const stop = useCallback((): Promise<void> => {
    if (stopTaskRef.current) return stopTaskRef.current;
    if (mountedRef.current) setStatus("stopping");

    // Wait for a pending camera permission/start before releasing its stream.
    const task = Promise.resolve().then(async () => {
      await startTaskRef.current;
      const scanner = scannerRef.current;
      try {
        if (scanner?.isScanning) await scanner.stop();
        scanner?.clear();
      } catch (cause) {
        if (mountedRef.current) setError(cameraError(cause));
      } finally {
        if (mountedRef.current) setStatus("idle");
      }
    }).finally(() => {
      stopTaskRef.current = null;
    });
    stopTaskRef.current = task;
    return task;
  }, []);

  const start = useCallback((): Promise<void> => {
    if (startTaskRef.current || stopTaskRef.current || scannerRef.current?.isScanning) {
      return Promise.resolve();
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("errUnsupported");
      return Promise.resolve();
    }
    setError(null);
    setResult(null);
    setStatus("starting");
    decodedRef.current = false;

    const task = Promise.resolve().then(async () => {
      if (!mountedRef.current) return;
      try {
        const scanner = scannerRef.current ?? new Html5Qrcode(elementId, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(250, Math.floor(Math.min(width, height) * 0.7));
              return { width: size, height: size };
            },
          },
          (decoded) => {
            if (!mountedRef.current || decodedRef.current) return;
            decodedRef.current = true;
            setResult(decoded);
            void stop();
            onDecodedRef.current?.(decoded);
          },
          () => {},
        );
        if (!mountedRef.current || decodedRef.current) {
          void stop();
        } else {
          setStatus("scanning");
        }
      } catch (cause) {
        if (mountedRef.current) {
          setError(cameraError(cause));
          setStatus("idle");
        }
        const scanner = scannerRef.current;
        if (scanner && !scanner.isScanning) {
          try { scanner.clear(); } catch { /* Target may already be unmounted. */ }
        }
      }
    }).finally(() => {
      startTaskRef.current = null;
    });
    startTaskRef.current = task;
    return task;
  }, [elementId, stop]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      void stop();
    };
  }, [stop]);

  return { status, result, error, start, stop };
}