
import { useEffect, useState } from "react";
import { getDistanceFromLatLonInKm } from "../utils/distance";

export default function RestaurantList({ results, searchTerm }) {
  const [sortBy, setSortBy] = useState("rating");
  const [userLocation, setUserLocation] = useState(null);
  const [sortedResults, setSortedResults] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        console.warn("Brak zgody na lokalizację");
      }
    );
  }, []);

  useEffect(() => {
    if (!results) return;

    const withDistance = results.map((res) => {
      let distance = null;
      if (userLocation && res.geometry?.location) {
        distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          res.geometry.location.lat,
          res.geometry.location.lng
        );
      }
      return { ...res, distance };
    });

    const sorted = [...withDistance].sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "reviews") return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
      if (sortBy === "distance") return (a.distance || Infinity) - (b.distance || Infinity);
      return 0;
    });

    setSortedResults(sorted);
  }, [results, sortBy, userLocation]);

  const [ocrResults, setOcrResults] = useState({});

  useEffect(() => {
    const fetchOCR = async () => {
      const updates = {};
      for (const place of sortedResults) {
        const photoRef = place.photos?.[0]?.photo_reference;
        if (!photoRef) continue;

        const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;

        try {
          const res = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl, dish: searchTerm }),
          });
          const data = await res.json();
          updates[place.place_id] = data;
        } catch (err) {
          updates[place.place_id] = { found: false, source: "none" };
        }
      }
      setOcrResults(updates);
    };

    if (searchTerm && sortedResults.length > 0) {
      fetchOCR();
    }
  }, [searchTerm, sortedResults]);

  return (
    <>
      <div className="mb-4">
        <label>Sortuj wg: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-1 border rounded">
          <option value="rating">Oceny</option>
          <option value="reviews">Liczby opinii</option>
          <option value="distance">Odległości</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {sortedResults.map((res) => {
          const photoRef = res.photos?.[0]?.photo_reference;
          const photoUrl = photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
            : null;

          const ocr = ocrResults[res.place_id];

          return (
            <div key={res.place_id} className="flex gap-4 border rounded shadow p-3 items-start">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={res.name}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{res.name}</h3>
                <p>Ocena: {res.rating || "brak"} ({res.user_ratings_total || 0} opinii)</p>
                {res.distance !== null && <p>{res.distance.toFixed(1)} km od Ciebie</p>}
                {ocr && (
                  <div className="mt-2">
                    <p><strong>Danie znalezione w menu:</strong> {ocr.found ? "✅ TAK" : "❌ NIE"}</p>
                    <p><strong>Źródło:</strong> {ocr.source}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
