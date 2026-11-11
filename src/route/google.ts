/* Todo:
-> Google for the Rute tab (owner, 11 Nov): the map, place suggestions, routes with traffic
    -> Maps JavaScript API is loaded only when the Rute tab opens with a key; nothing from Google before that
    -> Places Autocomplete (New) and Routes API are called over REST with the same browser key (referrer-restricted)
    -> Google's terms: the route and its times are shown only on the Google map in this tab
    -> cost: suggestions are debounced and share one session token per search; a route is asked for only on the button
*/
import { decodePolyline, nearestOnPath, type LngLat } from '../map/geo';
import type { PublicReport } from '../public-reports/data';

export const GOOGLE_KEY = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';
// Advanced markers need a map ID; Google's DEMO_MAP_ID works until the owner makes one (Cloud console > Map management)
export const GOOGLE_MAP_ID = (import.meta.env?.VITE_GOOGLE_MAP_ID as string | undefined) || 'DEMO_MAP_ID';
export const JAKARTA = { lat: -6.2088, lng: 106.8456 };

// --- the Maps JavaScript API, once per visit ---
// Why/Note: @types/google.maps is not installed; the few calls used here are typed loosely on purpose
export type Gmaps = any;
let loading: Promise<Gmaps> | undefined;
export function loadGoogleMaps(key = GOOGLE_KEY): Promise<Gmaps> {
  const existing = (window as any).google?.maps;
  if (existing?.Map) return Promise.resolve(existing);
  loading ??= new Promise((resolve, reject) => {
    const callback = '__ljGoogleReady';
    (window as any)[callback] = () => { delete (window as any)[callback]; resolve((window as any).google.maps); };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&language=id&region=ID&libraries=marker&callback=${callback}`;
    script.async = true;
    script.onerror = () => { loading = undefined; script.remove(); reject(new Error('Peta Google tidak dapat dimuat.')); };
    document.head.append(script);
  });
  return loading;
}
// --- end of loader ---

// --- Places Autocomplete (New) ---
export interface PlaceSuggestion { placeId: string; main: string; secondary: string }
export const newSessionToken = () => crypto.randomUUID();
export async function suggestPlaces(input: string, sessionToken: string, near: { lat: number; lng: number } = JAKARTA, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_KEY },
    body: JSON.stringify({ input, sessionToken, languageCode: 'id', includedRegionCodes: ['id'],
      locationBias: { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 30000 } } }),
  });
  if (!response.ok) throw new Error('Saran tempat belum tersedia.');
  const data = await response.json();
  return (data.suggestions ?? []).flatMap((item: any) => {
    const place = item.placePrediction;
    if (!place?.placeId) return [];
    return [{ placeId: place.placeId, main: place.structuredFormat?.mainText?.text ?? place.text?.text ?? '', secondary: place.structuredFormat?.secondaryText?.text ?? '' }];
  }).slice(0, 5);
}
// --- end of Places ---

// --- Routes API ---
export type Waypoint = { placeId: string; label: string } | { lat: number; lng: number; label: string };
export type TravelMode = 'DRIVE' | 'TWO_WHEELER';
export interface RouteOption { path: LngLat[]; seconds: number; freeSeconds: number; metres: number; label: string }

const seconds = (value: unknown) => typeof value === 'string' ? Number.parseFloat(value) || 0 : 0;
const waypoint = (point: Waypoint) => 'placeId' in point ? { placeId: point.placeId } : { location: { latLng: { latitude: point.lat, longitude: point.lng } } };

// input param : origin, destination, mode
// output      : up to 3 routes, fastest first, each with its line, time with traffic, time without, distance
export async function computeRoutes(origin: Waypoint, destination: Waypoint, mode: TravelMode, signal?: AbortSignal): Promise<RouteOption[]> {
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': 'routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description' },
    body: JSON.stringify({ origin: waypoint(origin), destination: waypoint(destination), travelMode: mode, routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: true, languageCode: 'id', regionCode: 'id', units: 'METRIC' }),
  });
  if (!response.ok) throw new Error(response.status === 403 ? 'Kunci Google belum mengizinkan Routes API.' : 'Rute tidak dapat dihitung saat ini.');
  const data = await response.json();
  return (data.routes ?? []).flatMap((route: any, index: number) => {
    const encoded = route.polyline?.encodedPolyline;
    if (typeof encoded !== 'string') return [];
    const path = decodePolyline(encoded);
    return path.length > 1 ? [{ path, seconds: seconds(route.duration), freeSeconds: seconds(route.staticDuration) || seconds(route.duration), metres: Number(route.distanceMeters) || 0, label: route.description || `Rute ${index + 1}` }] : [];
  }).slice(0, 3);
}
// --- end of Routes ---

// --- reports on the way ---
export interface ReportOnRoute { report: PublicReport; along: number; offset: number }
export const ROUTE_REACH_M = 60;
// input param : all reports, the route line, how far from the line counts (metres)
// output      : reports within reach, in the order you meet them from the start
export function reportsOnRoute(rows: PublicReport[], path: LngLat[], reach = ROUTE_REACH_M): ReportOnRoute[] {
  if (path.length < 2) return [];
  const pad = reach / 100_000 * 1.5, lngs = path.map(p => p[0]), lats = path.map(p => p[1]);
  const [west, east, south, north] = [Math.min(...lngs) - pad, Math.max(...lngs) + pad, Math.min(...lats) - pad, Math.max(...lats) + pad];
  return rows.flatMap(report => {
    if (report.lng < west || report.lng > east || report.lat < south || report.lat > north) return [];
    const near = nearestOnPath([report.lng, report.lat], path);
    return near.offset <= reach ? [{ report, along: near.along, offset: near.offset }] : [];
  }).sort((a, b) => a.along - b.along);
}
// --- end of reports on the way ---

// --- words for times and distances ---
export const minutes = (secs: number) => { const m = Math.max(1, Math.round(secs / 60)); return m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} j ${m % 60} mnt`; };
export const kilometres = (metres: number) => metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} km`;
export const arrival = (secs: number, from = Date.now()) => new Date(from + secs * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
// a Google Maps link for the trip (no key needed): https://developers.google.com/maps/documentation/urls/get-started
export const mapsLink = (origin: string, destination: string, mode: 'driving' | 'two-wheeler') =>
  `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}&destination=${encodeURIComponent(destination)}&travelmode=${mode === 'two-wheeler' ? 'two-wheeler' : 'driving'}`;
