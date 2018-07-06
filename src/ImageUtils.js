/**
 * Stored image
 */
import uuidjs from 'uuidjs'

const cache = {}

function makeCache (image) {
  const id = uuidjs.genV4().toString()
  cache[id] = image
  return id
}

function getPixelRatio () {
  return Number.isFinite(window.devicePixelRatio)
    ? Math.ceil(window.devicePixelRatio)
    : 1
}

function canvasToURL (canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob === null
        ? reject(new Error('cannot create blob'))
        : resolve(URL.createObjectURL(blob))
    })
  })
}

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image()

    function cleanup () {
      image.removeEventListener('load', onLoad, false)
      image.removeEventListener('error', onError, false)
    }

    function onLoad () {
      cleanup()
      resolve(image)
    }

    function onError () {
      cleanup()
      reject(new Error('image load failed'))
    }

    image.addEventListener('load', onLoad, false)
    image.addEventListener('error', onError, false)
    image.src = src
  })
}

function copyImage (image, width, height, smoothing) {
  const ratio = getPixelRatio()
  const w = width * ratio
  const h = height * ratio
  const context = createContext(w, h)
  context.imageSmoothingEnabled = smoothing
  context.drawImage(image, 0, 0, w, h)
  return context
}

async function makeImage (context, width, height) {
  const image = await loadImage(await canvasToURL(context.canvas))
  image.style.width = `${width}px`
  image.style.height = `${height}px`
  return image
}

export function createContext (width, height) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (context === null) throw new Error('create canvas failed')

  canvas.width = width
  canvas.height = height

  return context
}

export async function load (src, noSmoothing = false) {
  const image = await loadImage(src)
  const ratio = getPixelRatio()
  if (ratio !== 1 && noSmoothing) {
    const { width, height } = image
    return makeCache(
      await makeImage(copyImage(image, width, height, false), width, height)
    )
  }
  return makeCache(image)
}

export function readFromFile (file) {
  return load(URL.createObjectURL(file))
}

export function get (id) {
  if (id in cache) return cache[id]

  throw new Error('image not found')
}

export function clone (id) {
  return load(get(id).src)
}

export async function resize (id, width, height, noSmoothing = false) {
  return makeCache(
    await makeImage(
      copyImage(get(id), width, height, !noSmoothing),
      width,
      height
    )
  )
}

export async function trim (id, left, right, top, bottom) {
  const image = get(id)
  const dx = image.naturalWidth / image.width
  const dy = image.naturalHeight / image.height
  const width = image.width - left - right
  const height = image.height - top - bottom
  if (width <= 0 || height <= 0) throw new Error('cannot trim to empty')
  const context = createContext(width * dx, height * dy)
  context.drawImage(image, -left * dx, -top * dy)
  return makeCache(await makeImage(context, width, height))
}
