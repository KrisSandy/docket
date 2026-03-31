/**
 * Native file save and share utilities.
 * Wraps Capacitor Filesystem + Share plugins with web fallbacks.
 */

/**
 * Check if running in a native Capacitor environment.
 * Must use Capacitor.isNativePlatform() — checking for window.Capacitor
 * alone is insufficient because the Capacitor JS runtime is bundled
 * in web builds too, causing native-only APIs (Filesystem, Share) to
 * hit their web fallbacks and produce broken relative URLs.
 */
function isNative(): boolean {
  if (typeof window === 'undefined' || !('Capacitor' in window)) return false;
  const cap = (window as unknown as { Capacitor: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap.isNativePlatform === 'function' && cap.isNativePlatform();
}

/**
 * Save data to a file and optionally share it.
 * On native: writes to device filesystem, then opens share sheet.
 * On web: triggers a browser download.
 */
export async function saveAndShareFile(
  filename: string,
  content: string,
  mimeType: string = 'application/octet-stream'
): Promise<void> {
  if (isNative()) {
    try {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      // Write file to cache directory
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // Share the file (opens native share sheet)
      await Share.share({
        title: filename,
        url: result.uri,
      });

      return;
    } catch {
      // Fall through to web download if native fails
    }
  }

  // Web fallback: browser download
  downloadInBrowser(filename, content, mimeType);
}

/**
 * Trigger a browser download of a string as a file.
 */
export function downloadInBrowser(
  filename: string,
  content: string,
  mimeType: string = 'application/octet-stream'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Pick a file from the device filesystem.
 * On native: uses Capacitor Filesystem to read a file.
 * On web: returns null (HTML file input should be used instead).
 */
export async function pickFileNative(
  _extensions: string[] // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<{ content: string; name: string } | null> {
  if (!isNative()) return null;

  // On native, we rely on the HTML file input for now.
  // Capacitor Filesystem doesn't have a built-in file picker.
  // The native file picker is handled by the <input type="file"> element.
  return null;
}
