import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false
  }
};

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function normaliseLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST to upload a PDF.' });
  }

  try {
    const contentType = String(req.headers['content-type'] || '');
    if (!contentType.includes('application/pdf')) {
      return res.status(415).json({
        ok: false,
        error: 'The uploaded file must be a PDF.'
      });
    }

    const buffer = await readRequestBody(req);
    if (!buffer.length) {
      return res.status(400).json({ ok: false, error: 'The PDF upload was empty.' });
    }

    // Keep within a sensible limit for a Vercel function request.
    if (buffer.length > 12 * 1024 * 1024) {
      return res.status(413).json({
        ok: false,
        error: 'The PDF is larger than 12 MB. Export a smaller Chef Report or split it into two files.'
      });
    }

    const result = await pdf(buffer);
    const lines = normaliseLines(result.text);

    if (!lines.length) {
      return res.status(422).json({
        ok: false,
        error: 'The PDF contains no extractable text. It may be a scanned image rather than a generated report.'
      });
    }

    return res.status(200).json({
      ok: true,
      pageCount: Number(result.numpages || 0),
      lineCount: lines.length,
      lines
    });
  } catch (error) {
    console.error('Chef Report parsing failed:', error);
    return res.status(500).json({
      ok: false,
      error: 'The PDF could not be read by the server. Try downloading a fresh Chef Report from the booking system.'
    });
  }
}
