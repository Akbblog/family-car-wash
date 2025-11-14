'use client';

import { addCar } from '@/app/actions/user';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCarForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await addCar(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard'); // redirect after successful addition
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
      <h3 className="text-white uppercase tracking-widest font-bold mb-6">
        Add New Vehicle
      </h3>

      {error && (
        <p className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs text-center border border-red-500/20">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Make
          </label>
          <input
            name="make"
            type="text"
            placeholder="Vehicle Make"
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Model
          </label>
          <input
            name="model"
            type="text"
            placeholder="Vehicle Model"
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Color
          </label>
          <input
            name="color"
            type="text"
            placeholder="Vehicle Color"
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            License Plate
          </label>
          <input
            name="licensePlate"
            type="text"
            placeholder="License Plate Number"
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-[#ff3366] hover:text-white transition-all disabled:opacity-50"
        >
          {pending ? 'ADDING...' : 'ADD VEHICLE'}
        </button>
      </form>
    </div>
  );
}
