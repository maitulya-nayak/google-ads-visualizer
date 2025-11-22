// src/html-to-image.d.ts
declare module "html-to-image" {
  export function toPng(
    node: HTMLElement,
    options?: {
      cacheBust?: boolean;
      pixelRatio?: number;
      [key: string]: unknown;
    }
  ): Promise<string>;
}
