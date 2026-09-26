import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import login_bg from "../../assets/login_bg1.png";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  Bell,
  Users,
  MapPinIcon,
  ClipboardList,
} from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "ALERTS",
    description: "Timely alerts and notifications",
  },
  {
    icon: Users,
    title: "COORDINATION",
    description: "Multi-agency collaboration",
  },
  {
    icon: MapPinIcon,
    title: "INVENTORY",
    description: "Real-time tracking and monitoring",
  },
  {
    icon: ClipboardList,
    title: "INCIDENT REPORTING",
    description: "Efficient allocation and tracking",
  },
];

function Login() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setFormError("");

  if (!userId || !password) {
    setFormError("Please fill in all fields.");
    return;
  }

  try {
    const loggedInUser = await login(userId, password);
    const taskOnlyRoles = ["volunteer", "ngo_contact", "ngo"];
    const destination = taskOnlyRoles.includes(loggedInUser?.role)
      ? "/task"
      : "/dashboard";
    navigate(destination, { replace: true });
  } catch (err) {
    setFormError(err?.message || "Invalid credentials. Please try again.");
  }
};


  return (
    <div className="h-screen overflow-hidden font-sans text-slate-900">
      {/* Full-screen background */}
      <img
        src={login_bg}
        alt="Disaster response"
        className="fixed inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-[#031a38]/65" />

      <div className="relative z-10 flex h-full flex-col">
        <main className="min-h-0 flex-1 grid lg:grid-cols-[55%_45%]">
          {/* ========== LEFT SIDE ========== */}
          <section className="relative min-h-0 overflow-hidden">
            <div className="relative z-10 flex h-full flex-col justify-end">
              <div className="px-8 pb-10 lg:px-12 xl:px-16">
                <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white xl:text-4xl 2xl:text-5xl">
                  Prepared for Emergencies.
                  <br />
                  <span className="text-blue-300">Ready to Respond.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 xl:text-base">
                  A unified platform for disaster preparedness, emergency
                  response, relief coordination and recovery operations.
                </p>

                {/* Feature cards */}
                <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="rounded-xl border border-white/15 bg-white/5 p-3.5 backdrop-blur-md"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white">
                          <Icon size={18} />
                        </div>
                        <h3 className="mt-2.5 text-[11px] font-bold tracking-wider text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ========== RIGHT SIDE – LOGIN CARD ========== */}
          <section className="min-h-0 overflow-y-auto px-5 py-8 lg:px-8 xl:px-12">
            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-md">
                {/* Glass card */}
                <div className="w-full rounded-3xl border border-white/20 bg-slate-950/45 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl backdrop-saturate-150 sm:p-8">
                  {/* Header */}
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 shadow-lg shadow-blue-900/40">
                      <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Restricted Access
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      Department Authorised Personnel
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="mt-8 space-y-5">
                    {/* Official Email */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/90">
                        Official Email
                      </label>
                      <div className="relative">
                        <User
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/55"
                        />
                        <input
                          type="email"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="Enter your official email"
                          className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white/15 focus:ring-4 focus:ring-blue-400/25"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/90">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/55"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white/15 focus:ring-4 focus:ring-blue-400/25"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white/80"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Error message */}
                    {(formError || authError) && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-xs text-red-100 backdrop-blur-sm">
                        <span className="text-red-300">⚠</span>
                        {formError || authError}
                      </div>
                    )}

                    {/* Login button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-900/50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
                    >
                      <LogIn size={18} />
                      {loading ? "SIGNING IN…" : "LOGIN"}
                    </button>
                  </form>
                </div>

                {/* Security note */}
                <p className="mt-5 text-center text-[11px] font-medium text-white/55">
                  Authorised personnel only • Secure department access
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Login;
