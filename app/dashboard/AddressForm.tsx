'use client';

import { updateServiceDetails } from '@/app/actions/user';
import { useFormState, useFormStatus } from 'react-dom';  
import { useState, useEffect } from 'react';

type Props = {
  userData: {
    address?: string;
    city?: string;
    zip?: string;
    // --- ADD 'phone' HERE ---
    phone?: string;
    notes?: string;
    preferredDay1?: string;
    preferredTime1?: string;
    preferredDay2?: string;
    preferredTime2?: string;
  };
};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-[#ff3366] hover:text-white transition-all disabled:opacity-50"
    >
      {pending ? 'SAVING...' : 'SAVE DETAILS'}
    </button>
  );
}

// Helper components (no changes)
function DaySelect({ name, defaultValue }: { name: string, defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      required
      className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
    >
      <option value="" disabled>Select a day</option>
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
    </select>
  );
}
function TimeSelect({ name, defaultValue }: { name: string, defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      required
      className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
    >
      <option value="" disabled>Select a time</option>
      <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
      <option value="Afternoon (12pm-4pm)">Afternoon (12pm-4pm)</option>
    </select>
  );
}


export default function AddressForm({ userData }: Props) {
  
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const serverHasDetails = userData?.address && userData.preferredDay1 && userData.preferredDay2;
  const [currentHasDetails, setCurrentHasDetails] = useState(!!serverHasDetails);
  const [isEditing, setIsEditing] = useState(!serverHasDetails);

  useEffect(() => {
    if (state?.success) {
      setIsEditing(false);
      setCurrentHasDetails(true);
    }
  }, [state?.success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setPending(true);
  setError(null);

  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData) as {
    address: string;
    city: string;
    zip: string;
    phone: string;
    notes?: string;
    preferredDay1: string;
    preferredTime1: string;
    preferredDay2: string;
    preferredTime2: string;
  };

  try {
    const result = await updateServiceDetails(userData.id, data);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'An error occurred while saving details.');
    }
  } catch (err) {
    console.error(err);
    setError('An unexpected error occurred.');
  } finally {
    setPending(false);
  }
};

  // Show saved data
  if (currentHasDetails && !isEditing) {
    return (
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white uppercase tracking-widest font-bold">
            Address & Visit Details
          </h3>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-[#999] uppercase tracking-widest hover:text-[#ff3366]"
            >
              [ Edit ]
            </button>
        </div>
        <p className="text-sm text-green-500 mb-4">Your details are saved.</p>
        <div className="font-mono text-sm text-white/70 space-y-4">
          <div>
            <p className="text-xs text-[#999] uppercase">Address</p>
            <p>{userData.address}</p>
            <p>{userData.city}, {userData.zip}</p>
          </div>
          
          {/* --- ADD THIS BLOCK TO SHOW PHONE --- */}
          <div>
            <p className="text-xs text-[#999] uppercase">Contact</p>
            <p>{userData.phone || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-[#999] uppercase">Visit 1 Preference</p>
            <p>{userData.preferredDay1} ({userData.preferredTime1})</p>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase">Visit 2 Preference</p>
            <p>{userData.preferredDay2} ({userData.preferredTime2})</p>
          </div>
          <div className="pt-2 italic text-white/50">
            Notes: {userData.notes || 'N/A'}
          </div>
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
      <h3 className="text-white uppercase tracking-widest font-bold mb-6">
        {serverHasDetails ? 'Edit Address & Visit Details' : 'Save Address & Visit Details'}
      </h3>
      {state?.error && (
        <p className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs text-center border border-red-500/20">
          {state.error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* --- Address Fields --- */}
        <p className="text-sm text-[#999] font-bold tracking-wider">Step 1: Add Location & Schedule</p>
        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            
          </label>
          <input
            name="address"
            type="text"
            placeholder="Street Address"
            defaultValue={userData.address}
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2"></label>
            <input name="city" type="text" placeholder="Your City" defaultValue={userData.city} required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2"></label>
            <input name="zip" type="text" placeholder="Zip Code" defaultValue={userData.zip} required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
        </div>
        
        {/* --- ADD THIS BLOCK FOR PHONE --- */}
        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Contact Phone
            
          </label>
          <input
            name="phone" type="tel" placeholder="Your contact number"defaultValue={userData.phone} required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
        </div>
        
        {/* --- Scheduling Fields --- */}
        <p className="text-sm text-[#999] font-bold tracking-wider pt-4">Step 2: Scheduling (2 Visits)</p>
        
        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
          <label className="block text-[11px] text-white uppercase tracking-widest mb-2">Visit 1 Preference</label>
          <div className="grid grid-cols-2 gap-4">
            <DaySelect name="preferredDay1" defaultValue={userData.preferredDay1} />
            <TimeSelect name="preferredTime1" defaultValue={userData.preferredTime1} />
          </div>
        </div>
        
        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
          <label className="block text-[11px] text-white uppercase tracking-widest mb-2">Visit 2 Preference</label>
            <div className="grid grid-cols-2 gap-4">
            <DaySelect name="preferredDay2" defaultValue={userData.preferredDay2} />
            <TimeSelect name="preferredTime2" defaultValue={userData.preferredTime2} />
          </div>
        </div>

        {/* --- Notes Field --- */}
        <p className="text-sm text-[#999] font-bold tracking-wider pt-4">Step 3: Service Notes</p>
        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Gate Codes, Parking, etc.
          </label>
          <textarea
            name="notes"
            placeholder="e.g. My gate code is #1234."
            defaultValue={userData.notes}
            rows={3}
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>
        <SubmitButton pending={pending} />

        

        {serverHasDetails && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="w-full py-2 text-xs text-[#999] uppercase tracking-widest hover:text-white"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}