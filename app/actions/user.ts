'use server';

import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';

type State = {
  error?: string;
  success?: string;
};

// Server action: only handle DB and validation
export async function updateServiceDetails(formData: FormData): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to update details.' };
  }
  const userId = session.user.id;

  const data = {
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    zip: formData.get('zip') as string,
    preferredDay1: formData.get('preferredDay1') as string,
    preferredTime1: formData.get('preferredTime1') as string,
    preferredDay2: formData.get('preferredDay2') as string,
    preferredTime2: formData.get('preferredTime2') as string,
    phone: formData.get('phone') as string,
    notes: formData.get('notes') as string,
  };

  if (!data.address || !data.city || !data.zip || !data.preferredDay1 || !data.preferredTime1 || !data.phone) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, data);

    // Revalidate dashboard cache
    revalidatePath('/dashboard');

    return { success: 'Details saved successfully' };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred while saving details.' };
  }
}
