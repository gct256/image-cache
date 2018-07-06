export = ImageUtils

declare namespace ImageUtils {
  export function createContext(
    width: number,
    height: number
  ): CanvasRenderingContext2D

  export function load(src: string, noSmoothing?: boolean): Promise<string>

  export function readFromFile(file: File): Promise<string>

  export function get(id: string): HTMLImageElement

  export function clone(id: string): Promise<string>

  export function resize(
    id: string,
    width: number,
    height: number,
    noSmoothing?: boolean
  ): Promise<string>

  export function trim(
    id: string,
    left: number,
    right: number,
    top: number,
    bottom: number
  ): Promise<string>
}
