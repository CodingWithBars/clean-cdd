declare module 'haversine-distance' {
  export default function haversine(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ): number;
}
