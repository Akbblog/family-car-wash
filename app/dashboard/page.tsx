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

export const dynamic = 'force-dynamic';


async function getDashboardData(userId: string) {
  await connectDB();


  const [user, cars] = await Promise.all([
    User.findById(userId)
      .select(
        // ⭐ ADDED waitlistStatus + waitlistJoinedAt
        'name email isSubscribed address city zip notes preferredDay1 preferredTime1 preferredDay2 preferredTime2 phone waitlistStatus waitlistJoinedAt'
      )
      .lean(),

    Car.find({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) throw new Error('User not found');

  // Fix TypeScript issues
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

  // ⭐ ADDED CLEAN LOGIC VARIABLES
  const isSubscribed = (user as any).isSubscribed === true;
  const isWaitlisted = (user as any).waitlistStatus === "joined";
  // GET MEMBERSHIP TOGGLE VALUE
  const membershipEnabled = (user as any).membershipEnabled === true;



  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 pt-24">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-end mb-16 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Garage <span className="text-[#ff3366]">Control</span>
            </h1>
            <p className="text-[#999] uppercase tracking-widest text-sm">
              Manage your garage & subscription
            </p>
          </div>

          <SignOutButton />
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-12">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* MEMBERSHIP STATUS CARD */}
            <div
              className={`p-8 rounded-xl border ${isSubscribed
                ? 'bg-[#ff3366]/10 border-[#ff3366]/30'
                : isWaitlisted
                  ? 'bg-yellow-500/10 border-yellow-500/20'  // ⭐ WAITLIST COLOR
                  : 'bg-[#111] border-white/5'
                }`}
            >
              <h3 className="text-white uppercase font-bold mb-4 flex items-center">
                MEMBERSHIP STATUS

                {/* Pulse for active */}
                {isSubscribed && (
                  <span className="ml-2 inline-block w-2 h-2 bg-[#ff3366] rounded-full animate-pulse" />
                )}

                {/* ⭐ WAITLIST PULSE ICON */}
                {isWaitlisted && (
                  <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </h3>


              {/* ⭐ ACTIVE → WAITLISTED → INACTIVE */}
              {isSubscribed ? (
                // ⭐ ACTIVE VIEW
                <div>
                  <div className="text-2xl font-black text-[#ff3366] mb-2">
                    ACTIVE
                  </div>
                  <p className="text-[#999] text-sm">
                    Your premium membership is active — your bi-weekly service is secured.
                  </p>
                </div>

              ) : isWaitlisted ? (
                // ⭐ WAITLISTED VIEW
                <div>
                  <div className="text-2xl font-black text-yellow-500 mb-2">
                    WAITLISTED
                  </div>
                  <p className="text-[#999] text-sm mb-6">
                    You’re on our priority waitlist. We’ll notify you as soon as a membership spot opens.
                  </p>

                  <button
                    className="w-full py-4 bg-yellow-600 text-white font-bold uppercase tracking-widest text-sm opacity-60 cursor-not-allowed"
                    disabled
                  >
                    JOINED WAITLIST
                  </button>
                </div>

              ) : (
                // ⭐ NORMAL INACTIVE VIEW
                <div>
                  <div className="text-white/50 mb-6">INACTIVE</div>

                  {membershipEnabled ? (
                    <p className="text-[#999] text-sm mb-6">
                      Your membership is enabled — activate to begin services.
                    </p>
                  ) : (
                    <p className="text-[#999] text-sm mb-6">
                      Unlock your membership to enjoy premium bi-weekly detailing services.
                    </p>
                  )}

                  <SubscribeButton />
                </div>
              )}



            </div>

            <AddressForm userData={userData} />
            <AddCarForm />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <CarList cars={cars} />
          </div>

        </div>
      </div>
    </main>
  );
}
