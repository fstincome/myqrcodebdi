import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchHistoryStatistics } from "@/lib/history-statistics";

const { from, select, eq } = vi.hoisted(() => ({
  from: vi.fn(), select: vi.fn(), eq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

describe("history statistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    from.mockReturnValue({ select });
    select.mockReturnValue({ eq });
  });

  it("counts all scanned and generated links independently of the paginated list", async () => {
    eq.mockImplementation((_column, kind) => Promise.resolve({
      count: kind === "scanned" ? 37 : 24, error: null,
    }));
    expect(await fetchHistoryStatistics()).toEqual({ scanned: 37, generated: 24, total: 61 });
    expect(from.mock.calls).toEqual([["qr_history"], ["qr_history"]]);
    expect(select.mock.calls).toEqual([
      ["id", { count: "exact", head: true }],
      ["id", { count: "exact", head: true }],
    ]);
    expect(eq.mock.calls).toEqual([["kind", "scanned"], ["kind", "generated"]]);
  });

  it("returns zero for an empty history", async () => {
    eq.mockResolvedValue({ count: 0, error: null });
    expect(await fetchHistoryStatistics()).toEqual({ scanned: 0, generated: 0, total: 0 });
  });

  it("does not show partial or unavailable counts as valid statistics", async () => {
    const error = new Error("Read denied");
    eq.mockResolvedValueOnce({ count: null, error }).mockResolvedValueOnce({ count: 24, error: null });
    await expect(fetchHistoryStatistics()).rejects.toThrow("Read denied");
    eq.mockResolvedValue({ count: null, error: null });
    await expect(fetchHistoryStatistics()).rejects.toThrow("History counts unavailable");
  });
});