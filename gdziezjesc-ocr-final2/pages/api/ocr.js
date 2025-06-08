
import Tesseract from 'tesseract.js';

export default async function handler(req, res) {
  const { imageUrl, dish } = req.body;

  if (!imageUrl || !dish) {
    return res.status(400).json({ error: 'Brakuje imageUrl lub dish.' });
  }

  try {
    const result = await Tesseract.recognize(imageUrl, 'pol');
    const text = result.data.text;
    const found = text.toLowerCase().includes(dish.toLowerCase());
    const source = found ? "OCR" : "none";
    res.status(200).json({ found, source, text });
  } catch (err) {
    res.status(500).json({ error: 'Błąd OCR' });
  }
}
