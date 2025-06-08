
import { useEffect, useState } from "react";
import { getDistanceFromLatLonInKm } from "../utils/distance";

export default function RestaurantList({ results }) {
  const [sortBy, setSortBy] = useState("rating");
  const [userLocation, setUserLocation] = useState(null);
  const [sortedResults, setSortedResults] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.warn("Nie udało się pobrać lokalizacji");
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
        {sortedResults.map((res, idx) => {
          const photoRef = res.photos?.[0]?.photo_reference;
          const photoUrl = photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
            : null;
          const mapsLink = `https://www.google.com/maps/place/?q=place_id:${res.place_id}`;

          return (
            <div key={idx} className="flex gap-4 border rounded shadow p-3 items-start">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={res.name}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{res.name}</h3>
                <p>{res.vicinity}</p>
                <p>
                  Ocena: {res.rating || "brak"} ({res.user_ratings_total || 0} opinii)
                </p>
                {res.distance !== null && <p>{res.distance.toFixed(1)} km od Ciebie</p>}
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Zobacz w Google Maps
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
