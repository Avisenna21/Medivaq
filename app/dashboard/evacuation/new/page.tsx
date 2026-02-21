'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EvacuationForm } from '../form';

export default function NewEvacuationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const form = new FormData();

      // loop semua field text
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          form.append(key, value); // file langsung append
        } else if (Array.isArray(value)) {
          // kalau multiple file / multiple value
          value.forEach((v) => form.append(key, v));
        } else if (value !== null && value !== undefined) {
          form.append(key, String(value));
        }
      });
      console.log('FormData entries: ', form);
      const response = await fetch('/api/evacuations', {
        method: 'POST',
        body: form, // ✅ kirim FormData
        // ❗ JANGAN SET HEADER CONTENT-TYPE
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create evacuation');
      }

      const res = await response.json();

      router.push(`/dashboard/evacuation/${res.id}`);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            New Evacuation Request
          </h1>
          <p className="text-muted-foreground mt-2">
            Submit a medical evacuation request by filling out the form below
          </p>
        </div>

        <EvacuationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
