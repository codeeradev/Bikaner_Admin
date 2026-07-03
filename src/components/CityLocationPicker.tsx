import { Loader2, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

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
const SELECTED_ZOOM = 13;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// The form this component lives in has more fields (name, status, ...), but
// this component only ever reads/writes lat & lng, so it only declares that
// slice of the shape. useFormContext is generic-typed per-consumer, so this
// narrowing is safe as long as the parent form actually has these fields.
interface CityLocationFormValues {
  lat: number | null;
  lng: number | null;
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

export function CityLocationPicker() {
  const { setValue, watch } = useFormContext<CityLocationFormValues>();
  const lat = watch("lat");
  const lng = watch("lng");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const runSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(value)}&limit=5`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error("Location search failed");
      const data: NominatimResult[] = await response.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Nominatim's usage policy asks for at most ~1 request/second, so debounce input.
    debounceRef.current = setTimeout(() => runSearch(value), 500);
  };

  const selectCoordinates = (nextLat: number, nextLng: number) => {
    setValue("lat", nextLat, { shouldDirty: true, shouldValidate: true });
    setValue("lng", nextLng, { shouldDirty: true, shouldValidate: true });
  };

  const handleSelectResult = (result: NominatimResult) => {
    selectCoordinates(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name);
    setResults([]);
    setShowResults(false);
  };

  const hasLocation = lat != null && lng != null;
  const center: [number, number] = hasLocation ? [lat as number, lng as number] : DEFAULT_CENTER;
  const zoom = hasLocation ? SELECTED_ZOOM : DEFAULT_ZOOM;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Location</label>

      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search for a location..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {showResults && results.length > 0 && (
          <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">{result.display_name}</span>
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
          <ClickToPlaceMarker onSelect={selectCoordinates} />
          {hasLocation && (
            <Marker
              position={[lat as number, lng as number]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const position = (e.target as L.Marker).getLatLng();
                  selectCoordinates(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasLocation
          ? `Selected: ${(lat as number).toFixed(6)}, ${(lng as number).toFixed(6)} — drag the marker or click the map to adjust.`
          : "Search for an address or click the map to set the location."}
      </p>
    </div>
  );
}