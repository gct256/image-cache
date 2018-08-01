import * as ImageUtils from '../src/ImageUtils'

async function trim (root, id) {
  const id1 = await ImageUtils.trim(id, 25, 50, 75, 100)
  const image1 = ImageUtils.get(id1)
  root.appendChild(image1)
}

async function resize (root, id) {
  const id1 = await ImageUtils.resize(id, 100, 100)
  const image1 = ImageUtils.get(id1)
  root.appendChild(image1)

  const id2 = await ImageUtils.resize(id, 1000, 1000)
  const image2 = ImageUtils.get(id2)
  root.appendChild(image2)
}

async function rotate (root, id) {
  for (let degree = 30; degree <= 360; degree += 30) {
    const id1 = await ImageUtils.rotate(id, (Math.PI / 180) * degree)
    const image1 = ImageUtils.get(id1)
    root.appendChild(image1)
  }
}

async function main () {
  const root = document.getElementById('root')
  const id1 = await ImageUtils.load('./image.png')
  const image1 = ImageUtils.get(id1)
  root.appendChild(image1)

  await trim(root, id1)
  await resize(root, id1)
  await rotate(root, id1)
}

main().catch((er) => console.error(er))
