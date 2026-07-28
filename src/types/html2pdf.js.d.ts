// ─────────────────────────────────────────────────────────────
//  Type declarations for html2pdf.js (no official @types)
//  Provides a fluent API for converting HTML elements to PDF.
// ─────────────────────────────────────────────────────────────

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
    };
    jsPDF?: {
      unit?: string;
      format?: string | [number, number];
      orientation?: 'portrait' | 'landscape';
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(): Promise<void>;
    toPdf(): Html2PdfInstance;
    toCanvas(): Html2PdfInstance;
    toImg(): Html2PdfInstance;
    outputPdf(type?: string): Promise<string | Blob | ArrayBuffer>;
    then<T>(onFulfilled?: (value: unknown) => T): Promise<T>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
