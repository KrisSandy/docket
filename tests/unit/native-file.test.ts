import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadInBrowser } from '@/lib/native-file';

describe('native-file utilities', () => {
  describe('downloadInBrowser', () => {
    let clickMock: ReturnType<typeof vi.fn>;
    let createdAnchor: Record<string, unknown>;

    beforeEach(() => {
      clickMock = vi.fn();
      createdAnchor = { href: '', download: '', click: clickMock };

      vi.spyOn(document, 'createElement').mockReturnValue(createdAnchor as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates a blob with correct MIME type', () => {
      downloadInBrowser('test.json', '{"data":true}', 'application/json');
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('sets the filename on the anchor element', () => {
      downloadInBrowser('my-backup.hdbackup', 'content');
      expect(createdAnchor.download).toBe('my-backup.hdbackup');
    });

    it('clicks the anchor to trigger download', () => {
      downloadInBrowser('test.txt', 'hello');
      expect(clickMock).toHaveBeenCalledTimes(1);
    });

    it('cleans up the object URL after download', () => {
      downloadInBrowser('test.txt', 'hello');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('uses default MIME type when not specified', () => {
      downloadInBrowser('test.bin', 'binary-ish');
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
      expect(blob.type).toBe('application/octet-stream');
    });
  });
});
