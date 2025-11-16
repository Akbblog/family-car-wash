'use server';

import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Car from '@/lib/models/Car';
import User from '@/lib/models/User'; // ⬅️ ADDED: Needed to update user details
import { revalidatePath } from 'next/cache';

type Result = {
  success?: string;
  error?: string;
};

// ---------------------------------------------
// Your existing addCar function
// ---------------------------------------------
export async function addCar(prevState: Result, formData: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to add a car.' };
  }
  const userId = session.user.id;

  const data = {
    make: formData.get('make') as string,
    model: formData.get('model') as string,
    color: formData.get('color') as string,
    licensePlate: formData.get('licensePlate') as string,
  };

  if (!data.make || !data.model || !data.color || !data.licensePlate) {
    return { error: 'Please fill in all car fields.' };
  }

  try {
    await connectDB();
    await Car.create({ ...data, userId });

    // Revalidate dashboard page
    revalidatePath('/dashboard');

    return { success: 'Car added successfully' };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add car.' };
  }
}

// ---------------------------------------------
// 🚀 NEW FUNCTION: updateServiceDetails (Fixes the build error)
// ---------------------------------------------
export async function updateServiceDetails(
    prevState: Result, 
    formData: FormData
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to update details.' };
  }
  const userId = session.user.id;

  // 1. Gather all fields from the AddressForm
  const data = {
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    zip: formData.get('zip') as string,
    phone: formData.get('phone') as string, // ⬅️ The new field!
    notes: formData.get('notes') as string,
    preferredDay1: formData.get('preferredDay1') as string,
    preferredTime1: formData.get('preferredTime1') as string,
    preferredDay2: formData.get('preferredDay2') as string,
    preferredTime2: formData.get('preferredTime2') as string,
  };

  // 2. Simple Validation
  if (!data.address || !data.preferredDay1 || !data.preferredDay2) {
    return { error: 'Address and preferred days are required.' };
  }
  
  try {
    await connectDB();
    
    // 3. Update the User document in the database
    await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });

    // 4. Revalidate dashboard page to show updated details
    revalidatePath('/dashboard');

    return { success: 'Service details updated successfully' };
  } catch (err: any) {
    console.error('Update failed:', err);
    return { error: err.message || 'Failed to update service details.' };
  }
}