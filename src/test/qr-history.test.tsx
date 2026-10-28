import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isHistoryUrl } from "@/lib/qr-history";
import { useQrHistoryRecorder } from "@/hooks/useQrHistoryRecorder";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));

describe("isHistoryUrl", () => {
  it("accepts http and https links", () => {
    expect(isHistoryUrl("https://example.com/a?b=1")).toBe(true);
    expect(isHistoryUrl("http://example.com")).toBe(true);
  });

  it("rejects non-web values", () => {
    expect(isHistoryUrl("javascript:alert(1)")).toBe(false);
    expect(isHistoryUrl("not a link")).toBe(false);
    expect(isHistoryUrl("")).toBe(false);
  });
});

describe("useQrHistoryRecorder", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("saves a valid link once through the record-qr-event function", async () => {
    invoke.mockResolvedValue({ data: { saved: true }, error: null });
    const { result } = renderHook(() => useQrHistoryRecorder());
    act(() => result.current.record("https://example.com/promo", "generated", "Promo"));
    await waitFor(() => expect(result.current.saveStatus).toBe("saved"));
    expect(invoke).toHaveBeenCalledTimes(1);
    const [fn, opts] = invoke.mock.calls[0];
    expect(fn).toBe("record-qr-event");
    expect(opts.body.url).toBe("https://example.com/promo");
    expect(opts.body.kind).toBe("generated");
    expect(opts.body.caption).toBe("Promo");
    expect(opts.body.id).toEqual(expect.any(String));
  });

  it("ignores values that are not web links", () => {
    const { result } = renderHook(() => useQrHistoryRecorder());
    act(() => result.current.record("HELLO-1234", "scanned"));
    expect(invoke).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toBe("idle");
  });

  it("reports an error and allows retrying a failed save", async () => {
    invoke.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => useQrHistoryRecorder());
    act(() => result.current.record("https://example.com", "scanned"));
    await waitFor(() => expect(result.current.saveStatus).toBe("error"));
    invoke.mockResolvedValue({ data: { saved: true }, error: null });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.saveStatus).toBe("saved"));
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});
