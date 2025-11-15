'use client';

import { addCar } from '@/app/actions/user';
import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react'; 
// NOTE: Removed useEffect and useState for 'isOpen' as the form will always be visible.

// Define the initial state for useFormState. It must match the Result type 
// returned by the addCar server action.
const initialState: { error?: string; success?: string } = {};

// Helper component to display the submission status (Pending)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-[#ff3366] hover:text-white transition-all disabled:opacity-50"
    >
      {pending ? 'ADDING CAR...' : 'ADD VEHICLE'}
    </button>
  );
}

export default function AddCarForm() {
  // 🔑 CORE CHANGE: We use useFormState to manage the form state and action.
  // The 'formAction' is passed directly to the <form action={...}> prop.
  const [state, formAction] = useFormState(addCar, initialState);

  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
      <h3 className="text-white uppercase tracking-widest font-bold mb-6">
        Add New Vehicle
      </h3>
      {/* Display Error Message */}
      {state?.error && (
        <p className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs text-center border border-red-500/20">
          {state.error}
        </p>
      )}
      {/* Display Success Message */}
      {state?.success && (
        <p className="mb-4 p-3 bg-green-500/10 stext-green-500 text-xs text-center border border-green-500/20">
          {state.success}
        </p>
      )}
      
      {/* 🔑 CORE CHANGE: Using action={formAction} replaces the manual onSubmit handler. */}
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Make</label>
            <input name="make" type="text" placeholder="e.g. TOYOTA" required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Model</label>
            <input name="model" type="text" placeholder="e.g. CAMRY" required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Color</label>
            <input name="color" type="text" placeholder="e.g. BLACK" required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">License Plate</label>
            <input name="licensePlate" type="text" placeholder="e.g. 8ABC123" required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
        </div>
        
        {/* SubmitButton uses useFormStatus internally */}
        <SubmitButton />
        
      </form>
    </div>
  );
}