
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

// This is a temporary, local file storage solution for development.
// In a production environment, you should use a cloud storage service like Firebase Storage.

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Basic validation for file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' }, { status: 400 });
    }

    const maxFileSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxFileSize) {
        return NextResponse.json({ error: 'File is too large. Max size is 1MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${uuidv4()}-${file.name}`;

    // IMPORTANT: This saves the file to the `public` directory, making it publicly accessible.
    // Ensure the 'public/uploads' directory exists.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return the public URL of the uploaded file
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
