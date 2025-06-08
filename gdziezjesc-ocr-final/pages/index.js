
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import RestaurantList from "../components/RestaurantList";

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (dish, city) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?dish=${dish}&city=${city}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Błąd podczas wyszukiwania:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gdzie zjeść?</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Ładowanie wyników...</p>}
      <RestaurantList results={results} />
    </main>
  );
}
