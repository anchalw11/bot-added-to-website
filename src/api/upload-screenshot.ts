import { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const form = formidable({ uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error uploading file.' });
      }

      const file = files.screenshot;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      // You can access the uploaded file's path using file.filepath
      // In a real application, you would save this path to a database
      // along with user information.
      console.log('Screenshot uploaded:', file.filepath);

      res.status(200).json({ message: 'Screenshot uploaded successfully.' });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
