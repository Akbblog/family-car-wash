'use client';

import { updateServiceDetails } from '@/app/actions/user';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  userData: {
    address?: string;
    city?: string;
    zip?: string;
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

function DaySelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ''}
      required
      className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
    >
      <option value="" disabled>
        Select a day
      </option>
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
    </select>
  );
}

function TimeSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ''}
      required
      className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
    >
      <option value="" disabled>
        Select a time
      </option>
      <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
      <option value="Afternoon (12pm-4pm)">Afternoon (12pm-4pm)</option>
    </select>
  );
}

export default function AddressForm({ userData }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHasDetails, setCurrentHasDetails] = useState(!!userData?.address);
  const [isEditing, setIsEditing] = useState(!userData?.address);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateServiceDetails(formData); // server action
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setCurrentHasDetails(true);
        router.push('/dashboard'); // client-side redirect
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
    } finally {
      setPending(false);
    }
  };

  // ✅ Show saved details
  if (currentHasDetails && !isEditing) {
    return (
      <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white uppercase tracking-widest font-bold">Address & Visit Details</h3>
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
            <p>
              {userData.city}, {userData.zip}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase">Contact</p>
            <p>{userData.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase">Visit 1 Preference</p>
            <p>
              {userData.preferredDay1} ({userData.preferredTime1})
            </p>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase">Visit 2 Preference</p>
            <p>
              {userData.preferredDay2} ({userData.preferredTime2})
            </p>
          </div>
          <div className="pt-2 italic text-white/50">Notes: {userData.notes || 'N/A'}</div>
        </div>
      </div>
    );
  }

  // ✅ Show edit form
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
      <h3 className="text-white uppercase tracking-widest font-bold mb-6">
        {userData?.address ? 'Edit Address & Visit Details' : 'Save Address & Visit Details'}
      </h3>
      {error && (
        <p className="mb-4 p-3 bg-red-500/10 text-red-500 text-xs text-center border border-red-500/20">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address */}
        <input
          name="address"
          type="text"
          placeholder="Street Address"
          defaultValue={userData.address}
          required
          className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            type="text"
            placeholder="City"
            defaultValue={userData.city}
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
          <input
            name="zip"
            type="text"
            placeholder="Zip Code"
            defaultValue={userData.zip}
            required
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>
        {/* Phone */}
        <input
          name="phone"
          type="tel"
          placeholder="Contact Phone"
          defaultValue={userData.phone}
          required
          className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
        />
        {/* Scheduling */}
        <div className="grid grid-cols-2 gap-4">
          <DaySelect name="preferredDay1" defaultValue={userData.preferredDay1} />
          <TimeSelect name="preferredTime1" defaultValue={userData.preferredTime1} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DaySelect name="preferredDay2" defaultValue={userData.preferredDay2} />
          <TimeSelect name="preferredTime2" defaultValue={userData.preferredTime2} />
        </div>
        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Gate Codes, Parking, etc."
          defaultValue={userData.notes}
          rows={3}
          className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
        />
        <SubmitButton pending={pending} />
      </form>
    </div>
  );
}
