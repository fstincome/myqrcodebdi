import { describe, expect, it } from "vitest";
import { createQrContent, readQrContent } from "@/lib/qr-content";

describe("QR code information", () => {
  it("encodes a website or form link and its description inside the same QR content", () => {
    const url = "https://example.com/formulaire?service=inscription";
    const description = "Entreprise Exemple\nInscrivez-vous à notre formation.";
    const content = createQrContent(url, description);
    expect(content).toBe(`${url}\n\n${description}`);
    expect(readQrContent(content)).toEqual({ url, description, text: content });
  });

  it("keeps a link-only QR code unchanged when information is omitted", () => {
    expect(createQrContent(" https://example.com ", "  ")).toBe("https://example.com");
    expect(readQrContent("https://example.com")).toEqual({ url: "https://example.com", description: "", text: "https://example.com" });
  });

  it("does not include description text in the URL opened after a scan", () => {
    const result = readQrContent("https://example.com/form\r\n\r\nDescription avec https://other.example et du texte.");
    expect(result.url).toBe("https://example.com/form");
    expect(result.description).toBe("Description avec https://other.example et du texte.");
  });

  it("does not make unsafe links or unrelated text clickable", () => {
    expect(readQrContent("javascript:alert(1)\n\nDescription").url).toBeNull();
    expect(readQrContent("Notre entreprise\nhttps://example.com").url).toBeNull();
    expect(readQrContent("Juste du texte")).toEqual({ url: null, description: "", text: "Juste du texte" });
  });
});