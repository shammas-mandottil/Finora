import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, LockKeyhole, Wallet, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo, PrimaryButton } from "../components";
import { authRequest, setAccessToken } from "../authApi";

type Mode = "login" | "signup" | "mfa" | "forgot";
type LoginResult = { mfaRequired: boolean; challengeToken?: string; accessToken?: string };

export default function Login({ onSuccess, goHome }: { onSuccess: () => void; goHome: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (window.location.pathname.endsWith("/verify-email") && token) {
      authRequest<{ message: string }>("/verify-email", { token })
        .then(result => { setMessage(result.message); setMode("login"); })
        .catch(e => setError(e instanceof Error ? e.message : "Email verification failed"));
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await authRequest<{ message: string }>("/register", { displayName, email, password });
        setMessage(result.message);
        setMode("login");
      } else if (mode === "forgot") {
        const result = await authRequest<{ message: string }>("/forgot-password", { email });
        setMessage(result.message);
      } else if (mode === "mfa") {
        const result = await authRequest<{ accessToken: string }>("/mfa/challenge", { challengeToken: challenge, code });
        setAccessToken(result.accessToken);
        onSuccess();
      } else {
        const result = await authRequest<LoginResult>("/login", { email, password });
        if (result.mfaRequired && result.challengeToken) {
          setChallenge(result.challengeToken);
          setMode("mfa");
        } else if (result.accessToken) {
          setAccessToken(result.accessToken);
          onSuccess();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen lg:grid lg:grid-cols-2">
    <section className="relative hidden overflow-hidden px-12 py-12 lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -left-36 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"/>
      <button onClick={goHome} className="relative w-fit"><Logo/></button>
      <div className="relative max-w-xl">
        <h1 className="text-6xl font-extrabold leading-[1.08]">Your money,<br/><span className="text-mint">under control.</span></h1>
        <p className="mt-7 text-xl text-emerald-50/65">Track. Plan. Save. Grow.</p>
        <div className="mt-12 flex items-end gap-4">
          <div className="rounded-2xl border border-emerald-100/10 bg-gradient-to-br from-emerald-900 to-[#071b13] p-8">
            <Wallet size={82} className="text-mint"/><p className="mt-4 text-sm text-emerald-50/50">A clearer view of your money.</p>
          </div>
          <div className="flex h-40 items-end gap-2">{[35,55,75,100].map(v=><div key={v} style={{height:`${v}%`}} className="w-8 rounded-t-lg bg-gradient-to-t from-emerald-800 to-mint"/>)}</div>
        </div>
      </div>
      <p className="relative text-xs text-emerald-50/35">Secure your finances. Build your future.</p>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass w-full max-w-[480px] rounded-[28px] p-7 sm:p-10">
        <div className="mb-7 flex justify-center lg:hidden"><Logo/></div>
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-mint to-emerald text-forest"><Wallet size={32}/></div>
          <h2 className="mt-5 text-3xl font-bold">{mode==="mfa"?"Verify it's you":mode==="signup"?"Create your account":mode==="forgot"?"Reset your password":"Welcome back!"}</h2>
          <p className="mt-2 text-sm text-emerald-50/55">{mode==="mfa"?"Enter the six-digit code from your authenticator app":mode==="signup"?"Create your FINORA account":mode==="forgot"?"We'll email you a secure reset link":"Sign in to manage your money."}</p>
        </div>
        {message && <p role="status" className="mt-5 rounded-xl border border-mint/20 bg-emerald-400/10 p-3 text-sm text-mint">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {mode==="signup" && <input required minLength={2} maxLength={80} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-emerald-100/20 bg-black/15 px-4 py-4 text-sm outline-none placeholder:text-emerald-50/40"/>}
          {mode!=="mfa" && <>
            <label className="flex items-center gap-3 rounded-xl border border-emerald-100/20 bg-black/15 px-4 py-4"><Mail size={19} className="text-emerald-100/55"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" className="w-full bg-transparent text-sm outline-none placeholder:text-emerald-50/40"/></label>
            {mode!=="forgot" && <label className="flex items-center gap-3 rounded-xl border border-emerald-100/20 bg-black/15 px-4 py-4"><LockKeyhole size={19} className="text-emerald-100/55"/><input required minLength={10} type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-transparent text-sm outline-none placeholder:text-emerald-50/40"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></label>}
            {mode==="login" && <div className="flex justify-end text-xs"><button type="button" onClick={()=>{setMode("forgot");setError("");setMessage("");}} className="text-mint">Forgot password?</button></div>}
          </>}
          {mode==="mfa" && <label className="block text-sm text-emerald-50/65">6-digit verification code<input required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} placeholder="000000" className="mt-2 w-full rounded-xl border border-emerald-100/20 bg-black/15 px-4 py-4 text-center text-2xl tracking-[.5em] outline-none"/></label>}
          <PrimaryButton><span className="flex w-full items-center justify-center gap-2">{busy?"Please wait…":mode==="mfa"?"Verify & continue":mode==="signup"?"Create account":mode==="forgot"?"Send reset link":"Sign in"} <ArrowRight size={17}/></span></PrimaryButton>
        </form>
        {mode==="login" && <><div className="my-6 flex items-center gap-4 text-xs text-emerald-50/35"><span className="h-px flex-1 bg-emerald-100/15"/>OR<span className="h-px flex-1 bg-emerald-100/15"/></div><button disabled className="w-full rounded-xl border border-emerald-100/25 py-3 text-sm font-medium opacity-50">Google sign-in (OAuth provider not configured)</button></>}
        <p className="mt-7 text-center text-sm text-emerald-50/55">
          {mode==="mfa"?"Need to restart?":mode==="signup"?"Already have an account?":mode==="forgot"?"Remembered your password?":"Don't have an account?"}
          <button onClick={()=>{setMode(mode==="login"?"signup":"login");setCode("");setError("");setMessage("");}} className="ml-1 font-semibold text-mint">{mode==="login"?"Sign up":"Sign in"}</button>
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-50/40"><ShieldCheck size={15}/> Secure your finances. Build your future.</div>
      </div>
    </section>
  </main>;
}
