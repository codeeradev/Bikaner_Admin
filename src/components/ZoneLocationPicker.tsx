import { Loader2, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { City } from "@/api";

// Leaflet's default marker icon paths are computed relative to a URL that
// doesn't exist once bundled (Vite/Webpack), so the marker silently fails to
// render unless we point it at the bundled asset URLs ourselves.
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Geographic center of India
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 14;
const SEARCH_DEBOUNCE_MS = 500;
// Rough bounding box (in degrees) drawn around the selected city's center,
// used as a second layer of restriction (on top of the text query) so that a
// search like "Sector 15" can't match a same-named area in a different city.
const CITY_SEARCH_RADIUS_DEGREES = 0.35;

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  residential?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
  namedetails?: { name?: string; [key: string]: string | undefined };
}

/** Picks the most specific, human-friendly label out of a Nominatim result. */
function extractAreaLabel(result: NominatimResult): string {
  const explicitName = result.namedetails?.name;
  if (explicitName) return explicitName;

  const address = result.address;
  const candidate =
    address?.suburb ||
    address?.neighbourhood ||
    address?.quarter ||
    address?.residential ||
    address?.road ||
    address?.city_district ||
    address?.village ||
    address?.town;
  if (candidate) return candidate;

  return result.display_name.split(",")[0].trim();
}

/** Defensive filter: makes sure a search result's address actually mentions the selected city. */
function resultBelongsToCity(result: NominatimResult, cityName: string): boolean {
  const normalizedCity = cityName.trim().toLowerCase();
  if (!normalizedCity) return true;

  const candidates = [
    result.address?.city,
    result.address?.town,
    result.address?.village,
    result.address?.county,
    result.address?.state_district,
    result.address?.suburb,
  ].filter((value): value is string => Boolean(value));

  const matchesAddress = candidates.some(
    (value) =>
      value.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(value.toLowerCase()),
  );
  if (matchesAddress) return true;

  return result.display_name.toLowerCase().includes(normalizedCity);
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: String(lat),
      lon: String(lng),
      addressdetails: "1",
      namedetails: "1",
    });
    const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data: NominatimResult = await response.json();
    return extractAreaLabel(data);
  } catch {
    return null;
  }
}

// The form this component lives in has more fields (description,
// deliveryCharge, ...), but this component only ever reads/writes this
// slice of the shape. useFormContext is generic-typed per-consumer, so this
// narrowing is safe as long as the parent form actually has these fields.
interface ZoneLocationFormValues {
  name: string;
  cityId: string;
  lat: number | null;
  lng: number | null;
  locationLabel: string;
}

/** Imperatively pans/zooms the map whenever the target coordinates change. */
function RecenterOnChange({
  lat,
  lng,
  zoom,
}: {
  lat: number | null;
  lng: number | null;
  zoom: number;
}) {
  const map = useMap();
  const hasCenteredOnce = useRef(false);

  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], zoom, { animate: hasCenteredOnce.current });
    hasCenteredOnce.current = true;
    // Only re-run when the coordinates actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return null;
}

/** Lets the user click anywhere on the map to drop/move the marker. */
function ClickToPlaceMarker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface ZoneLocationPickerProps {
  /** Cities available for selection, used to look up a city's lat/lng/name when it's picked. */
  cities: City[];
}

export function ZoneLocationPicker({ cities }: ZoneLocationPickerProps) {
  const { setValue, watch, getValues } = useFormContext<ZoneLocationFormValues>();
  const cityId = watch("cityId");
  const lat = watch("lat");
  const lng = watch("lng");

  const selectedCity = cities.find((city) => city.id === cityId) ?? null;

  // Local search box state. Initialized once from the form's saved
  // locationLabel (relevant when editing), then owned by the component.
  const [query, setQuery] = useState(() => getValues("locationLabel") ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestId = useRef(0);
  const reverseGeocodeRequestId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks whether we're still on the effect's first run (relevant when
  // editing a zone: reset() has already populated cityId/lat/lng/locationLabel
  // from the saved zone before this component mounts, so that first run must
  // NOT clobber the saved values with the city's default center).
  const isInitialRun = useRef(true);
  const prevCityId = useRef<string | undefined>(undefined);

  // Close the suggestions dropdown when the user clicks outside of it.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // React to city selection: center on the city, and (for real user changes,
  // not the initial edit-restore) reset the marker + search state.
  useEffect(() => {
    if (!cityId) return;
    const city = cities.find((c) => c.id === cityId);
    if (!city || city.lat == null || city.lng == null) return;

    if (isInitialRun.current) {
      isInitialRun.current = false;
      prevCityId.current = cityId;

      if (lat == null || lng == null) {
        // Brand-new zone: default the marker to the city's center.
        setValue("lat", city.lat, { shouldDirty: false });
        setValue("lng", city.lng, { shouldDirty: false });
      } else if (!query) {
        // Editing a zone that has a saved lat/lng but no stored label (e.g.
        // created before this feature existed) — best-effort backfill so the
        // search box isn't left blank.
        reverseGeocode(lat, lng).then((label) => {
          if (label) {
            setQuery(label);
            setValue("locationLabel", label, { shouldDirty: false });
          }
        });
      }
      return;
    }

    if (prevCityId.current !== cityId) {
      prevCityId.current = cityId;
      setValue("lat", city.lat, { shouldDirty: true, shouldValidate: true });
      setValue("lng", city.lng, { shouldDirty: true, shouldValidate: true });
      setValue("locationLabel", "", { shouldDirty: true });
      setQuery("");
      setResults([]);
      setShowResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, cities]);

  const runSearch = useCallback(async (value: string, city: City) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const requestId = ++searchRequestId.current;
    setIsSearching(true);
    try {
      // Restrict the search text to the selected city...
      const structuredQuery = `${value}, ${city.name}, India`;
      const params = new URLSearchParams({
        format: "json",
        addressdetails: "1",
        namedetails: "1",
        limit: "6",
        q: structuredQuery,
      });
      // ...and, when we know the city's coordinates, also restrict the
      // geographic search area so a same-named area in another city can't
      // slip through.
      if (city.lat != null && city.lng != null) {
        const left = city.lng - CITY_SEARCH_RADIUS_DEGREES;
        const right = city.lng + CITY_SEARCH_RADIUS_DEGREES;
        const top = city.lat + CITY_SEARCH_RADIUS_DEGREES;
        const bottom = city.lat - CITY_SEARCH_RADIUS_DEGREES;
        params.set("viewbox", `${left},${top},${right},${bottom}`);
        params.set("bounded", "1");
      }

      const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Search failed");
      const data: NominatimResult[] = await response.json();
      if (requestId !== searchRequestId.current) return; // a newer search superseded this one

      const scoped = data.filter((result) => resultBelongsToCity(result, city.name));
      setResults(scoped);
      setShowResults(true);
    } catch {
      if (requestId === searchRequestId.current) setResults([]);
    } finally {
      if (requestId === searchRequestId.current) setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!selectedCity) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Nominatim's usage policy asks for at most ~1 request/second, so debounce input.
    debounceRef.current = setTimeout(() => runSearch(value, selectedCity), SEARCH_DEBOUNCE_MS);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const nextLat = parseFloat(result.lat);
    const nextLng = parseFloat(result.lon);
    const label = extractAreaLabel(result);

    setValue("lat", nextLat, { shouldDirty: true, shouldValidate: true });
    setValue("lng", nextLng, { shouldDirty: true, shouldValidate: true });
    setValue("locationLabel", label, { shouldDirty: true });
    setQuery(label);
    setResults([]);
    setShowResults(false);

    // Auto-fill the Zone Name field, but never overwrite something the user already typed.
    const currentName = getValues("name");
    if (!currentName || !currentName.trim()) {
      setValue("name", label, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleManualPositionChange = (nextLat: number, nextLng: number) => {
    setValue("lat", nextLat, { shouldDirty: true, shouldValidate: true });
    setValue("lng", nextLng, { shouldDirty: true, shouldValidate: true });

    const requestId = ++reverseGeocodeRequestId.current;
    setIsReverseGeocoding(true);
    reverseGeocode(nextLat, nextLng).then((label) => {
      if (requestId !== reverseGeocodeRequestId.current) return; // superseded by a newer move
      setIsReverseGeocoding(false);
      if (label) {
        setQuery(label);
        setValue("locationLabel", label, { shouldDirty: true });
      }
    });
  };

  const hasLocation = lat != null && lng != null;
  const center: [number, number] = hasLocation
    ? [lat as number, lng as number]
    : selectedCity?.lat != null && selectedCity?.lng != null
      ? [selectedCity.lat, selectedCity.lng]
      : DEFAULT_CENTER;
  const zoom = hasLocation || selectedCity ? SELECTED_ZOOM : DEFAULT_ZOOM;

  const helperText = !cityId
    ? "Select a city above to search for a zone or area."
    : isReverseGeocoding
      ? "Detecting the nearest area..."
      : hasLocation
        ? `Selected: ${(lat as number).toFixed(6)}, ${(lng as number).toFixed(6)} — drag the marker or click the map to adjust.`
        : "Search for an area above, or click the map to set the location.";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Search Zone / Area</label>

      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            disabled={!cityId}
            placeholder={cityId ? "Search for a sector, locality, or area..." : "Select a city first"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {showResults && results.length > 0 && (
          <ul className="absolute z-[1200] mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <span className="font-medium">{extractAreaLabel(result)}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {result.display_name}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-md border">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "420px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterOnChange lat={lat} lng={lng} zoom={SELECTED_ZOOM} />
          {cityId && <ClickToPlaceMarker onSelect={handleManualPositionChange} />}
          {hasLocation && (
            <Marker
              position={[lat as number, lng as number]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const position = (e.target as L.Marker).getLatLng();
                  handleManualPositionChange(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  );
}