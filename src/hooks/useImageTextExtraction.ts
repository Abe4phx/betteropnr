import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const useImageTextExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      setImagePreviews((prev) => [...prev, base64Image]);

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

  const extractMultipleTexts = async (files: File[]): Promise<string> => {
    if (files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 5) {
      toast({
        title: 'Too many images',
        description: 'Please upload a maximum of 5 images at once.',
        variant: 'destructive',
      });
      throw new Error('Too many images');
    }

    setIsExtracting(true);

    try {
      const extractedTexts: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!validateFile(file)) {
          toast({
            title: `Invalid file ${i + 1}`,
            description: 'Skipping this file.',
            variant: 'destructive',
          });
          continue;
        }

        const base64Image = await convertToBase64(file);
        setImagePreviews((prev) => [...prev, base64Image]);

        const { data, error } = await supabase.functions.invoke('extract-profile-text', {
          body: { image: base64Image },
        });

        if (error) {
          console.error(`Error extracting text from image ${i + 1}:`, error);
          toast({
            title: `Failed to extract from image ${i + 1}`,
            description: 'Continuing with other images...',
            variant: 'destructive',
          });
          continue;
        }

        if (data?.text) {
          extractedTexts.push(data.text);
        }
      }

      if (extractedTexts.length === 0) {
        throw new Error('No text could be extracted from any image');
      }

      toast({
        title: 'Text extracted!',
        description: `Successfully extracted text from ${extractedTexts.length} image(s).`,
      });

      // Concatenate with section separators
      return extractedTexts
        .map((text, index) => {
          if (index === 0) return text;
          return `\n\n--- Profile Section ${index + 1} ---\n\n${text}`;
        })
        .join('');
    } catch (error) {
      console.error('Error in extractMultipleTexts:', error);
      toast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Failed to extract text from images',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsExtracting(false);
    }
  };

  const clearPreviews = () => {
    setImagePreviews([]);
  };

  const removePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    isExtracting,
    imagePreviews,
    extractText,
    extractMultipleTexts,
    clearPreviews,
    removePreview,
  };
};
