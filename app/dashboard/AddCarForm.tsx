'use client';

import { addCar } from '@/app/actions/user';
import { useFormState, useFormStatus } from 'react-dom';
// Removed unused imports: useState, useEffect

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
  // State hook for Server Action response
  const [state, formAction] = useFormState(addCar, initialState);
  
  // This structure matches your screenshot: the form is always visible.
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
      <h3 className="text-white uppercase tracking-widest font-bold mb-6">
        Add New Vehicle
      </h3>
      
      {/* Error/Success messages */}
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
      
      {/* ALIGNMENT FIX: Adjusted vertical spacing between rows (space-y-5) */}
      <form action={formAction} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          {/* Make Input */}
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Make</label>
            {/* ALIGNMENT FIX: Reduced input height (py-2 instead of py-3) for a cleaner line */}
            <input 
                name="make" 
                type="text" 
                placeholder="e.g. TOYOTA" 
                required 
                className="w-full bg-black border border-white/10 px-4 py-2 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" 
            />
          </div>
          {/* Model Input */}
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Model</label>
            <input 
                name="model" 
                type="text" 
                placeholder="e.g. CAMRY" 
                required 
                className="w-full bg-black border border-white/10 px-4 py-2 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Color Input */}
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Color</label>
            <input 
                name="color" 
                type="text" 
                placeholder="e.g. BLACK" 
                required 
                className="w-full bg-black border border-white/10 px-4 py-2 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" 
            />
          </div>
          {/* License Plate Input */}
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">License Plate</label>
            <input 
                name="licensePlate" 
                type="text" 
                placeholder="e.g. 8ABC123" 
                required 
                className="w-full bg-black border border-white/10 px-4 py-2 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" 
            />
          </div>
        </div>
        
        <SubmitButton />
        
        <button
          type="button"
          className="w-full py-2 text-xs text-[#999] uppercase tracking-widest hover:text-white"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}