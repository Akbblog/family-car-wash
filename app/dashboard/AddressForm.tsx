'use client';

import { updateServiceDetails } from '@/app/actions/user';
import { useFormStatus } from 'react-dom';
import { useState, useEffect, useActionState } from 'react';
import DateTimePicker from '@/components/DateTimePicker';

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

function SubmitButton() {
  const { pending } = useFormStatus();
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

export default function AddressForm({ userData }: Props) {
  // Initialize with empty object to match Result type
  const [state, formAction] = useActionState(updateServiceDetails, {});

  const serverHasDetails = userData?.address && userData.preferredDay1 && userData.preferredDay2;
  const [currentHasDetails, setCurrentHasDetails] = useState(!!serverHasDetails);
  const [isEditing, setIsEditing] = useState(!serverHasDetails);

  // Sequential Flow State
  const [step, setStep] = useState(1);
  const [visit1, setVisit1] = useState<{ date: Date | null, time: string }>({ date: null, time: "" });
  const [visit2, setVisit2] = useState<{ date: Date | null, time: string }>({ date: null, time: "" });

  // Initialize state from props if available
  useEffect(() => {
    if (userData.preferredDay1) {
      const d = Date.parse(userData.preferredDay1);
      if (!isNaN(d)) setVisit1(prev => ({ ...prev, date: new Date(d) }));
    }
    if (userData.preferredTime1) setVisit1(prev => ({ ...prev, time: userData.preferredTime1 || "" }));

    if (userData.preferredDay2) {
      const d = Date.parse(userData.preferredDay2);
      if (!isNaN(d)) setVisit2(prev => ({ ...prev, date: new Date(d) }));
    }
    if (userData.preferredTime2) setVisit2(prev => ({ ...prev, time: userData.preferredTime2 || "" }));
  }, [userData]);

  useEffect(() => {
    if (state?.success) {
      setIsEditing(false);
      setCurrentHasDetails(true);
    }
  }, [state]);

  const handleNext = () => {
    setStep(2);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setStep(1);
  };

  const handleCancel = () => {
    // If we have details, we revert to summary view.
    if (serverHasDetails) {
      setIsEditing(false);
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
            onClick={handleEdit}
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
      <form action={formAction} className="space-y-4">
        {/* --- Address Fields --- */}
        <p className="text-sm text-[#999] font-bold tracking-wider">Location & Contact</p>
        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Address
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
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">City</label>
            <input name="city" type="text" placeholder="Your City" defaultValue={userData.city} required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">Zip Code</label>
            <input name="zip" type="text" placeholder="Zip Code" defaultValue={userData.zip} required className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="Contact Phone"
            defaultValue={userData.phone}
            className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
          />
        </div>

        {/* --- Scheduling Fields --- */}
        <p className="text-sm text-[#999] font-bold tracking-wider pt-4">Scheduling (2 Visits)</p>

        {/* Hidden inputs to ensure data is submitted for both visits regardless of current step */}
        <input type="hidden" name="preferredDay1" value={visit1.date ? visit1.date.toDateString() : ""} />
        <input type="hidden" name="preferredTime1" value={visit1.time} />
        <input type="hidden" name="preferredDay2" value={visit2.date ? visit2.date.toDateString() : ""} />
        <input type="hidden" name="preferredTime2" value={visit2.time} />

        <div className="space-y-6">
          <DateTimePicker
            key={step} // Force fresh instance on step change
            label={step === 1 ? "Visit 1 Preference" : "Visit 2 Preference"}
            dayName={step === 1 ? "preferredDay1_picker" : "preferredDay2_picker"} // Dummy names, actual data handled by hidden inputs
            timeName={step === 1 ? "preferredTime1_picker" : "preferredTime2_picker"}
            defaultDay={step === 1 ? (visit1.date ? visit1.date.toDateString() : userData.preferredDay1) : (visit2.date ? visit2.date.toDateString() : userData.preferredDay2)}
            defaultTime={step === 1 ? (visit1.time || userData.preferredTime1) : (visit2.time || userData.preferredTime2)}
            onSelectionChange={(d, t) => {
              if (step === 1) setVisit1({ date: d, time: t });
              else setVisit2({ date: d, time: t });
            }}
          />

          {/* --- Notes Field (Always Visible) --- */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-[#999] font-bold tracking-wider mb-4">Service Notes</p>
            <div>
              <label className="block text-[11px] text-[#999] uppercase tracking-widest mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="e.g. Gate Codes, Parking, etc."
                defaultValue={userData.notes}
                rows={3}
                className="w-full bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
              />
            </div>
          </div>

          {step === 1 ? (
            <div className="mt-4 flex gap-2">
              {serverHasDetails && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/3 py-3 bg-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!visit1.date || !visit1.time}
                className={`py-3 bg-[#ff3366] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#ff1149] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${serverHasDetails ? 'w-2/3' : 'w-full'}`}
              >
                Next: Schedule Visit 2
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
              >
                Back
              </button>
              <div className="w-2/3">
                <SubmitButton />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}