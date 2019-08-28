import { ImageUtils } from '../src';

const setImage = (
  root: HTMLElement,
  caption: string,
  image: HTMLImageElement,
): void => {
  const div = document.createElement('div');
  const p = document.createElement('p');

  div.className = 'image';
  div.appendChild(image);
  div.appendChild(p);
  root.appendChild(div);

  const bounds = image.getBoundingClientRect();

  p.textContent = `${caption}
url: ${image.src}
size: ${image.width} x ${image.height}
natural size: ${image.naturalWidth} x ${image.naturalHeight}
bounds: ${bounds.width} x ${bounds.height}`;
};

const copy = async (srcId: string): Promise<HTMLImageElement> => {
  const id = await ImageUtils.clone(srcId);

  return ImageUtils.get(id);
};

const resize = async (
  srcId: string,
  width: number,
  height: number,
  smoothing: boolean,
): Promise<HTMLImageElement> => {
  const id = await ImageUtils.resize(srcId, width, height, smoothing);

  return ImageUtils.get(id);
};

const trim = async (srcId: string): Promise<HTMLImageElement> => {
  const id = await ImageUtils.trim(srcId, 25, 49, 75, 99);

  return ImageUtils.get(id);
};

const rotate = async (
  srcId: string,
  degree: number,
): Promise<HTMLImageElement> => {
  const id = await ImageUtils.rotate(srcId, (Math.PI / 180) * degree);

  return ImageUtils.get(id);
};

const main = async (): Promise<void> => {
  const root = document.getElementById('root');

  if (root === null) return;

  const id1 = await ImageUtils.load('./image.png');
  const image1 = ImageUtils.get(id1);

  setImage(root, 'original', image1);
  setImage(root, 'copy', await copy(id1));
  setImage(root, 'shrink', await resize(id1, 400 / 2, 300 / 2, true));
  setImage(
    root,
    'shrink, no smoothing',
    await resize(id1, 400 / 2, 300 / 2, false),
  );
  setImage(root, 'enlarge', await resize(id1, 400 * 2, 300 * 2, true));
  setImage(
    root,
    'enlarge, no smoothing',
    await resize(id1, 400 * 2, 300 * 2, false),
  );
  setImage(root, 'trim', await trim(id1));
  for (let i = 30; i < 360; i += 30) {
    // eslint-disable-next-line no-await-in-loop
    setImage(root, `rotate ${i}deg`, await rotate(id1, i));
  }
};

main().catch(console.error);
