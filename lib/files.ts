export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Mock-server accepts attachments inline (no object storage) — keep requests reasonable. */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
