
import { createWorker } from 'tesseract.js';

export default async function handler(req, res) {
  const { imageUrl, restaurantName } = req.body;

  console.log("OCR uruchomiony dla restauracji:", restaurantName);

  if (!imageUrl) {
    console.log("Brak obrazka do przetworzenia OCR.");
    return res.status(400).json({ error: 'Brak imageUrl' });
  }

  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();

    console.log("OCR zakończony dla:", restaurantName);
    console.log("Rozpoznany tekst:", text);

    res.status(200).json({ text });
  } catch (error) {
    console.error("Błąd podczas OCR:", error);
    res.status(500).json({ error: 'Błąd OCR' });
  }
}
