import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const useImageTextExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WEBP image.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const extractText = async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      throw new Error('Invalid file');
    }

    setIsExtracting(true);

    try {
      const base64Image = await convertToBase64(file);
      setImagePreview(base64Image);

      const { data, error } = await supabase.functions.invoke('extract-profile-text', {
        body: { image: base64Image },
      });

      if (error) {
        console.error('Error extracting text:', error);
        throw new Error(error.message || 'Failed to extract text');
      }

      if (!data?.text) {
        throw new Error('No text found in image');
      }

      toast({
        title: 'Text extracted!',
        description: 'Review and edit the extracted text as needed.',
      });

      return data.text;
    } catch (error) {
      console.error('Error in extractText:', error);
      toast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Failed to extract text from image',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsExtracting(false);
    }
  };

  const clearPreview = () => {
    setImagePreview(null);
  };

  return {
    isExtracting,
    imagePreview,
    extractText,
    clearPreview,
  };
};
