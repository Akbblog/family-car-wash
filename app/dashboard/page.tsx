import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SubscribeButton from './SubscribeButton';
import AddCarForm from './AddCarForm';
import AddressForm from './AddressForm';
import connectDB from '@/lib/db';
import Car from '@/lib/models/Car';
import User from '@/lib/models/User';
import CarList from './CarList';
import SignOutButton from '@/components/SignOutButton'; 
import WaitingListButton from "@/components/WaitingListButton";


export const dynamic = 'force-dynamic';

async function getDashboardData(userId: string) {
  await connectDB();
  
  const [user, cars] = await Promise.all([
    User.findById(userId)
      .select('name email isSubscribed isOnWaitingList address city zip notes preferredDay1 preferredTime1 preferredDay2 preferredTime2 phone') 
      .lean(),
    Car.find({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) throw new Error('User not found');

  // --- THIS IS THE FIX ---
  // Cast `user` to `any` to bypass TypeScript's incorrect type inference
  const userData = {
    address: (user as any).address || null,
    city: (user as any).city || null,
    zip: (user as any).zip || null,
    notes: (user as any).notes || null,
    preferredDay1: (user as any).preferredDay1 || null,
    preferredTime1: (user as any).preferredTime1 || null,
    preferredDay2: (user as any).preferredDay2 || null,
    preferredTime2: (user as any).preferredTime2 || null,
    phone: (user as any).phone || null,
  };
  // -----------------------

  // Also cast `cars` to `any[]` for safety
  const serializedCars = (cars as any[]).map(car => ({
    _id: car._id.toString(),
    make: car.make,
    model: car.model,
    licensePlate: car.licensePlate,
    color: car.color,
  }));

  return { user, cars: serializedCars, userData };
}

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { user, cars, userData } = await getDashboardData(session.user.id);

  // --- 2. THE NEW LOGIC ---
  // Read the "switch" from your Vercel environment variables
  const subscriptionsOpen = process.env.SUBSCRIPTIONS_OPEN === 'true';

    // Get the user's status from the database
  const isSubscribed = (user as any).isSubscribed || false;
  const isOnWaitingList = (user as any).isOnWaitingList || false;
  // --- END NEW LOGIC ---

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end mb-16 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Garage <span className="text-[#ff3366]">Control</span>
            </h1>
            <p className="text-[#999] uppercase tracking-widest text-sm">
              {/* Cast user here as well */}
              Welcome back, {(user as any).name}
            </p>
          </div>
          
          <SignOutButton />

        </div>

        {/* --- 3. UPDATED MEMBERSHIP STATUS CARD ---
              This now contains the full logic for all 4 states.
            */}
            <div
              className={`p-8 rounded-xl border ${
                isSubscribed
                  ? 'bg-[#ff3366]/10 border-[#ff3366]/30'
                  : 'bg-[#111] border-white/5'
              }`}
            >
              <h3 className="text-white uppercase tracking-widest font-bold mb-4 flex items-center">
                MEMBERSHIP STATUS
                {isSubscribed && (
                  <span className="ml-2 inline-block w-2 h-2 bg-[#ff3366] rounded-full animate-pulse" />
                )}
              </h3>
              
              {isSubscribed ? (
                // STATE 1: User is ACTIVE
                <div>
                  <div className="text-2xl font-black text-[#ff3366] mb-2">ACTIVE</div>
                  <p className="text-[#999] text-sm">Your service preferences are saved.</p>
                </div>
              ) : subscriptionsOpen ? (
                // STATE 2: User is INACTIVE, but subscriptions are OPEN
                <div>
                  <div className="text-white/50 mb-6">INACTIVE</div>
                  <p className="text-[#999] text-sm mb-6">
                    Activate your plan to start bi-weekly services.
                  </p>
                  <SubscribeButton />
                </div>
              ) : isOnWaitingList ? (
                // STATE 3: User is INACTIVE, subscriptions are CLOSED, but user IS on the list
                <div>
                  <div className="text-2xl font-black text-blue-400 mb-2">ON WAITING LIST</div>
                  <p className="text-[#999] text-sm">
                    You're on the list! We'll contact you as soon as a slot becomes available.
                  </p>
                </div>
              ) : (
                // STATE 4: User is INACTIVE, subscriptions are CLOSED, and user is NOT on the list
                <div>
                  <div className="text-white/50 mb-6">WE'RE AT CAPACITY</div>
                  <p className="text-[#999] text-sm mb-6">
                    Our subscription slots are currently full. Join the waiting list to be notified when we have an opening.
                  </p>
                  <WaitingListButton />
                </div>
              )}
            </div>
            
            <AddressForm userData={userData} />

            <AddCarForm />
          </div>

          {/* Right Column: Car Grid */}
          <div className="space-y-8">
            <CarList cars={cars} />
          </div>


    </main>
  );
}