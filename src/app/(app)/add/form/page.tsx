import { Suspense } from 'react';
import AddFormClient from './add-form-client';

export default function AddFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><p className="text-[15px] text-muted-foreground">Loading...</p></div>}>
      <AddFormClient />
    </Suspense>
  );
}
