declare module 'jsdom' {
  export class JSDOM {
    constructor(html: string, options?: {
      url?: string;
      contentType?: string;
      includeNodeLocations?: boolean;
      runScripts?: 'dangerously' | 'outside-only' | undefined;
      resources?: 'usable' | undefined;
      pretendToBeVisual?: boolean;
      virtualConsole?: unknown;
    });
    window: Window & {
      document: Document;
    };
  }
}

declare module '@mozilla/readability' {
  export class Readability {
    constructor(doc: Document);
    parse(): {
      title: string;
      content: string;
      textContent: string;
      length: number;
      excerpt: string;
    } | null;
  }
}
