'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

interface VerifyPageProps {
  params: {
    token: string;
  };
}

export default function VerifyPage({ params }: VerifyPageProps) {
  useEffect(() => {
    // Redirigir automáticamente a la descarga del ticket
    redirect(`/ticket/download/${params.token}`);
  }, [params.token]);

  return null;
}