import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function savePaymentSlip(file: File, bookingId: string): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payment-slips');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `payment_slip_${bookingId}_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filepath, buffer);
    
    // Return relative URL for storing in database
    return `/uploads/payment-slips/${filename}`;
  } catch (error) {
    console.error('Error saving payment slip:', error);
    throw new Error('Failed to save payment slip');
  }
}

export function validatePaymentSlip(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type (images and PDFs only)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only images (JPEG, PNG, GIF) and PDF files are allowed' };
  }

  return { isValid: true };
} 