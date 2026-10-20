import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQrScanner } from "@/hooks/useQrScanner";
import Scan from "@/pages/Scan";

const mock = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn(), clear: vi.fn(), instances: [] as MockScanner[] }));

interface MockScanner {
  isScanning: boolean;
  decoded?: (value: string) => void;
  config?: { qrbox: (width: number, height: number) => { width: number; height: number } };
}

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: class implements MockScanner {
    isScanning = false;
    decoded?: (value: string) => void;
    config?: MockScanner["config"];
    constructor(private id: string) { mock.instances.push(this); }
    start(_camera: unknown, config: MockScanner["config"], decoded: (value: string) => void) {
      this.config = config;
      this.decoded = decoded;
      // Reproduce the library replacing DOM before React updates camera state.
      const target = document.getElementById(this.id);
      if (target) target.innerHTML = "<video></video>";
      return mock.start(this);
    }
    async stop() { await mock.stop(); this.isScanning = false; }
    clear() {
      mock.clear();
      const target = document.getElementById(this.id);
      if (target) target.innerHTML = "";
    }
  },
}));

beforeEach(() => {
  mock.instances.length = 0;
  mock.start.mockReset().mockImplementation(async (scanner: MockScanner) => { scanner.isScanning = true; });
  mock.stop.mockReset().mockResolvedValue(undefined);
  mock.clear.mockReset();
  Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn() } });
});
afterEach(async () => { cleanup(); await act(async () => {}); });

describe("QR scanner camera lifecycle", () => {
  it("reads a decoded URL without crashing when the library replaces camera DOM", async () => {
    render(<MemoryRouter><Scan /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Démarrer la caméra" }));
    await waitFor(() => expect(mock.start).toHaveBeenCalledOnce());
    await act(async () => { mock.instances[0]?.decoded?.("https://example.com/qr"); });
    expect(screen.getByText("https://example.com/qr")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ouvrir le lien" })).toHaveAttribute("href", "https://example.com/qr");
    await waitFor(() => expect(mock.stop).toHaveBeenCalledOnce());
  });

  it("does not request the camera twice during a pending start", async () => {
    let complete: (() => void) | undefined;
    mock.start.mockImplementation((scanner: MockScanner) => new Promise<void>((resolve) => {
      complete = () => { scanner.isScanning = true; resolve(); };
    }));
    const { result } = renderHook(() => useQrScanner("test-camera"));
    await act(async () => { void result.current.start(); void result.current.start(); });
    expect(mock.start).toHaveBeenCalledOnce();
    await act(async () => { complete?.(); });
    expect(result.current.status).toBe("scanning");
  });

  it("fits the scan box inside a narrow mobile camera view", async () => {
    const { result } = renderHook(() => useQrScanner("test-camera"));
    await act(async () => { await result.current.start(); });
    expect(mock.instances[0]?.config?.qrbox(180, 240)).toEqual({ width: 125, height: 125 });
    expect(mock.instances[0]?.config?.qrbox(640, 480)).toEqual({ width: 250, height: 250 });
  });

  it("stops once when decoding happens before start resolves", async () => {
    mock.start.mockImplementation(async (scanner: MockScanner) => {
      scanner.decoded?.("https://example.com/fast");
      scanner.decoded?.("https://example.com/duplicate");
      scanner.isScanning = true;
    });
    const { result } = renderHook(() => useQrScanner("test-camera"));
    await act(async () => { await result.current.start(); });
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.result).toBe("https://example.com/fast");
    expect(mock.stop).toHaveBeenCalledOnce();
  });

  it("releases the stream if the page closes while permission is pending", async () => {
    let complete: (() => void) | undefined;
    mock.start.mockImplementation((scanner: MockScanner) => new Promise<void>((resolve) => {
      complete = () => { scanner.isScanning = true; resolve(); };
    }));
    const { result, unmount } = renderHook(() => useQrScanner("test-camera"));
    await act(async () => { void result.current.start(); });
    unmount();
    await act(async () => { complete?.(); });
    await waitFor(() => expect(mock.stop).toHaveBeenCalledOnce());
    expect(mock.instances[0]?.isScanning).toBe(false);
  });

  it("handles permission refusal and allows a successful retry", async () => {
    mock.start.mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
    const { result } = renderHook(() => useQrScanner("test-camera"));
    await act(async () => { await result.current.start(); });
    expect(result.current.error).toBe("errPermission");
    expect(result.current.status).toBe("idle");
    await act(async () => { await result.current.start(); });
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe("scanning");
  });
});