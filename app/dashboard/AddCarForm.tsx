'use client';

import { addCar } from '@/app/actions/user';
import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';

// The initial state must match the return type of the action.
const initialState: { error?: string; success?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-[#ff3366] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'ADDING VEHICLE...' : 'ADD VEHICLE'}
    </button>
  );
}

export default function AddCarForm() {
  const [state, formAction] = useFormState(addCar, initialState);
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-center py-4 bg-[#111] border border-white/5 rounded-xl uppercase tracking-widest font-bold text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
      >
        + Add New Vehicle
      </button>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 p-5 rounded-xl">
      {/* Reduced margin below header (mb-4) */}
      <h3 className="text-white uppercase tracking-widest font-bold mb-4">
        Add New Vehicle
      </h3>

      {state?.error && (
        <p className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs text-center border border-red-500/20">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mb-4 p-3 bg-green-500/10 text-green-500 text-xs text-center border border-green-500/20">
          {state.success}
        </p>
      )}
      
      {/* Reduced overall vertical spacing (space-y-3) */}
      <form action={formAction} className="space-y-3">
        
        {/* 🔑 FIXED STACK FIX: Removed sm:grid-cols-2 */}
        <div className="grid grid-cols-2 gap-4">
          
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Make</label>
            <input 
              name="make"
               type="text"
               placeholder="e.g. TOYOTA"
               required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
          
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Model</label>
            <input name="model" type="text" placeholder="e.g. CAMRY" required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
        </div>
        
        {/* 🔑 FIXED STACK FIX: Removed sm:grid-cols-2 */}
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
        
        <SubmitButton />
        
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-full py-2 text-xs text-[#999] uppercase tracking-widest hover:text-white"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}