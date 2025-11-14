'use server';

import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Car from '@/lib/models/Car';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // <-- THIS IS THE MISSING LINE

type State = {
  error?: string;
  success?: string;
};

// This is your existing function for saving the address
export async function updateServiceDetails(prevState: State, formData: FormData): Promise<State> {
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

  if (!data.address || !data.city || !data.zip || !data.preferredDay1  || !data.preferredTime1 || !data.phone) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, data);
    
    // This will now work because 'redirect' is imported
    revalidatePath('/dashboard'); 
    redirect('/dashboard');

  } catch (error) {
    console.error(error);
    return { error: 'An error occurred while saving details.' };
  }
}

// --- This is your existing addCar function (no changes) ---
export async function addCar(prevState: State, formData: FormData): Promise<State> {
  const make = formData.get('make') as string;
  const model = formData.get('model') as string;
  const color = formData.get('color') as string;
  const licensePlate = formData.get('licensePlate') as string;

  if (!make || !model || !color || !licensePlate) {
    return { error: 'Please fill in all vehicle fields.' };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to add a car.' };
  }
  const userId = session.user.id;

  try {
    await connectDB();
    await Car.create({
      userId,
      make,
      model,
      color,
      licensePlate,
    });
    
    // This will also work now
    revalidatePath('/dashboard');
    redirect('/dashboard');

  } catch (error) {
    console.error(error);
    return { error: 'An error occurred while adding the car.' };
  }
}