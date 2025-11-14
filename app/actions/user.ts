'use server';

import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Car from '@/lib/models/Car';
import { revalidatePath } from 'next/cache';

export async function addCar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'You must be logged in' };

  const make = formData.get('make')?.toString();
  const model = formData.get('model')?.toString();
  const color = formData.get('color')?.toString();
  const licensePlate = formData.get('licensePlate')?.toString();

  if (!make || !model || !color || !licensePlate)
    return { error: 'All fields are required' };

  try {
    await connectDB();
    await Car.create({ make, model, color, licensePlate, userId: session.user.id });
    revalidatePath('/dashboard');
    return { success: 'Car added successfully' };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add car' };
  }
}
