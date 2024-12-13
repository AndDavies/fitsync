import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/images/ascent_logo.png" alt="Ascent Logo" width={40} height={40}/>
            <span className="font-bold text-lg text-gray-800">Ascent</span>
          </div>
          {/* Nav Links - placeholder */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            <Link href="#products" className="hover:text-gray-900 transition">Products</Link>
            <Link href="#pricing" className="hover:text-gray-900 transition">Pricing</Link>
            <Link href="#customers" className="hover:text-gray-900 transition">Customers</Link>
            <Link href="#about" className="hover:text-gray-900 transition">About</Link>
            <Link href="#learn" className="hover:text-gray-900 transition">Learn</Link>
          </div>
          {/* CTA */}
          <Link href="/login">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-pink-500">
              Sign In
            </button>
          </Link>

        </div>
      </nav>

      {/* Hero Section */}
      <header className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Become Your Strongest, Inside and Out
            </h1>
            <p className="text-lg text-gray-700">
            Our adaptive platform blends AI-powered insights, human coaching, and holistic health metrics—so you get more than workouts. You get a dedicated mentor, data analyst, and supportive community helping you improve performance, lifestyle, and well-being, all from a clean, user-friendly interface.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="#demo">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  Schedule a Demo
                </button>
              </Link>
              <Link href="#learn-more">
                <button className="px-6 py-3 bg-transparent text-blue-600 font-medium border border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 mt-10 md:mt-0 md:ml-12 bg-transparent">
            {/* Placeholder image or illustration */}
            <Image src="/images/hero_right_ascent.png" alt="Dashboard preview" width={500} height={400} className="rounded-xl shadow-lg"/>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="products" className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Adaptive, AI-Guided Coaching</h2>
          <p className="text-gray-700 mb-10">Our intelligent system fine-tunes your workouts and lifestyle recommendations, ensuring every session helps you progress steadily toward your unique goals.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-blue-600 text-xl">💪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Data-Driven Insights & Predictive Metrics</h3>
              <p className="text-sm text-gray-600">
              Go beyond surface-level tracking. Tap into advanced analytics that forecast plateaus, celebrate milestones, and reveal the lifestyle factors fueling your best performances.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-blue-600 text-xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hyper-Personalized Programming</h3>
              <p className="text-sm text-gray-600">
                Our AI continuously refines your workout plan—adapting exercises, intensity, and volume so each session moves you closer to your goals.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Integrated Human Expertise</h3>
              <p className="text-sm text-gray-600">
                Your coach’s insights combine with intelligent algorithms, delivering both nuanced, personal feedback and data-backed guidance for truly balanced progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Heart of Gym Management */}
      <section id="about" className="w-full py-16 bg-gradient-to-r from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">The Heart of Your Gym Management</h2>
          <p className="text-gray-700 text-center mb-10">Simplify and streamline your admin workflow.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Item 1 */}
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-2xl">💳</div>
              <div>
                <h4 className="font-semibold text-gray-800">Streamlined Billing & Payments</h4>
                <p className="text-sm text-gray-600">
                  Automate billing cycles, integrate Stripe, and gain financial insights to inform your decisions.
                </p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-2xl">👥</div>
              <div>
                <h4 className="font-semibold text-gray-800">Manage Members with Ease</h4>
                <p className="text-sm text-gray-600">
                  Automated onboarding, attendance trends, and data capture for greater engagement and retention.
                </p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-2xl">📆</div>
              <div>
                <h4 className="font-semibold text-gray-800">Schedules, Simplified</h4>
                <p className="text-sm text-gray-600">
                  Self-service reservations, automated waitlists, and streamlined class management in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="demo" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Gym?</h2>
          <p className="text-gray-700 mb-8">
            See how Ascent can optimize your operations, enrich your members’ experience, and accelerate your growth.        
          </p>
          <Link href="#demo">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
              Schedule a Demo
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        &copy; 2024 Ascent. All rights reserved.
      </footer>
    </div>
  );
}
