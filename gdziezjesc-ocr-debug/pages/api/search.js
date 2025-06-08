
export default async function handler(req, res) {
  const { dish, city } = req.query;

  if (!dish || !city) {
    return res.status(400).json({ error: 'Brak wymaganych parametrów.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza API.' });
  }

  const query = encodeURIComponent(`${dish} ${city}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=restaurant&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error_message) {
      return res.status(500).json({ error: data.error_message });
    }

    res.status(200).json({ results: data.results });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania danych.' });
  }
}
