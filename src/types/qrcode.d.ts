declare module 'qrcode' {
  interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
  }
  function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
  const defaultExport: { toDataURL: typeof toDataURL };
  export default defaultExport;
}
