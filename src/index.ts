import UUID from 'pure-uuid';

type HTMLCanvasElementEx = HTMLCanvasElement & {
  msToBlob(): Blob;
};

/** Internal image cache. */
const cache: { [key: string]: HTMLImageElement } = {};

const getPixelRatioAsInteger = (): number => {
  const ratio = window.devicePixelRatio;

  if (typeof ratio !== 'number') return 1;

  return Math.ceil(ratio);
};

/**
 * Make image cache.
 *
 * @param image Image
 */
const makeCache = (image: HTMLImageElement): string => {
  const id = new UUID(4).toString();

  cache[id] = image;

  return id;
};

/**
 * Get canvas blob URL.
 *
 * @param canvas Canvas
 */
const canvasToURL = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob === null) {
          reject(new Error('cannot create blob'));
        } else {
          resolve(URL.createObjectURL(blob));
        }
      });

      return;
    } catch (er) {
      try {
        const blob = (canvas as HTMLCanvasElementEx).msToBlob();

        if (blob === null) {
          reject(new Error('cannot create blob'));
        } else {
          resolve(URL.createObjectURL(blob));
        }
      } catch (er2) {
        reject(er);
      }
    }
  });

/**
 * Load image.
 *
 * @param src URL of image
 */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = document.createElement('img');

    const handler: EventListenerObject = {
      handleEvent(ev: Event): void {
        image.removeEventListener('load', handler);
        image.removeEventListener('error', handler);

        if (ev.type === 'load') {
          resolve(image);
        } else {
          reject(new Error('image load failed'));
        }
      },
    };

    image.addEventListener('load', handler, false);
    image.addEventListener('error', handler, false);
    image.src = src;
  });

/**
 * Create CanvasRenderingContext2D with size.
 *
 * @param width context width.
 * @param height context height.
 * @returns context.
 */
const createContext = (
  width: number,
  height: number,
): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) throw new Error('create canvas failed');

  canvas.width = width;
  canvas.height = height;

  return context;
};

/**
 * Copy image with size.
 *
 * @param image image element
 * @param width width of output size.
 * @param height height of output size.
 * @param smoothing smoothing with imageSmoothingEnabled.
 */
const copyImage = (
  image: HTMLImageElement,
  width: number,
  height: number,
  smoothing = true,
): CanvasRenderingContext2D => {
  const context = createContext(width, height);

  if (!smoothing) context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, width, height);
  context.imageSmoothingEnabled = true;

  return context;
};

/**
 * Crate image element from canvas rendering context.
 *
 * @param context Canvas rendering context
 * @param width Width
 * @param height Height
 */
const makeImage = async (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): Promise<HTMLImageElement> => {
  const image = await loadImage(await canvasToURL(context.canvas));
  const ratio = getPixelRatioAsInteger();

  image.style.width = `${width / ratio}px`;
  image.style.height = `${height / ratio}px`;

  return image;
};

/** Image utilities. */
export const ImageUtils = {
  createContext,

  /**
   * Load image from URL.
   *
   * @param src URL of image
   * @returns ID of image.
   */
  async load(src: string): Promise<string> {
    const image = await loadImage(src);
    const { naturalWidth, naturalHeight } = image;

    return makeCache(
      await makeImage(
        copyImage(image, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight,
      ),
    );
  },

  /**
   * Load image from File object.
   *
   * @param file file object.
   * @returns ID of image.
   */
  readFromFile(file: File): Promise<string> {
    return ImageUtils.load(URL.createObjectURL(file));
  },

  /**
   * Get loaded image by ID.
   *
   * @param id ID of image.
   * @throws image not loaded.
   */
  get(id: string): HTMLImageElement {
    if (id in cache) return cache[id];

    throw new Error('image not found');
  },

  /**
   * Create clone of loaded image.
   *
   * @param id id ID of image.
   * @returns ID of image.
   * @throws image not loaded.
   */
  clone(id: string): Promise<string> {
    return ImageUtils.load(ImageUtils.get(id).src);
  },

  /**
   * Create resized image from loaded image.
   *
   * @param id ID of image.
   * @param width width
   * @param height height
   * @param smoothing smoothing resize with imageSmoothingEnabled.
   * @returns ID of image.
   * @throws image not loaded.
   */
  async resize(
    id: string,
    width: number,
    height: number,
    smoothing = true,
  ): Promise<string> {
    return makeCache(
      await makeImage(
        copyImage(ImageUtils.get(id), width, height, smoothing),
        width,
        height,
      ),
    );
  },

  /**
   * Create trimed image from loaded image.
   *
   * @param id ID of image.
   * @param left triming size from left edge
   * @param right triming size from right edge
   * @param top triming size from top edge
   * @param bottom triming size from bottom edge
   * @returns ID of image.
   * @throws image not loaded.
   */
  async trim(
    id: string,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): Promise<string> {
    const image = ImageUtils.get(id);
    const width = image.naturalWidth - left - right;
    const height = image.naturalHeight - top - bottom;

    if (width <= 0 || height <= 0) throw new Error('cannot trim to empty');

    const context = createContext(width, height);

    context.drawImage(image, -left, -top);

    return makeCache(await makeImage(context, width, height));
  },

  /**
   * Create rotated image from loaded image.
   *
   * @param id ID of image.
   * @param radian rotate angle.
   * @returns ID of image.
   * @throws image not loaded.
   */
  async rotate(id: string, radian: number): Promise<string> {
    const image = ImageUtils.get(id);
    const { naturalWidth, naturalHeight } = image;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const x1 = cos * naturalWidth;
    const y1 = sin * naturalWidth;
    const x2 = -sin * naturalHeight;
    const y2 = cos * naturalHeight;
    const x3 = x1 + x2;
    const y3 = y1 + y2;
    const w = Math.max(0, x1, x2, x3) - Math.min(0, x1, x2, x3);
    const h = Math.max(0, y1, y2, y3) - Math.min(0, y1, y2, y3);
    const iw = Math.ceil(w);
    const ih = Math.ceil(h);
    const context = createContext(iw, ih);

    context.translate(w / 2, h / 2);
    context.rotate(radian);
    context.translate(naturalWidth / -2, naturalHeight / -2);
    context.drawImage(image, 0, 0);

    return makeCache(await makeImage(context, iw, ih));
  },
};
