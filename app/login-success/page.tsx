"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Direct assignment forces a fresh page reload so that AuthContext parses the token
      window.location.href = "/dashboard";
    } else {
      router.push("/login?error=Google authentication failed");
    }
  }, [searchParams, router]);

  return (
    <div className="text-center py-4">
      <span className="w-10 h-10 border-4 border-[#2D1B3D] border-t-[#C9A84C] rounded-full animate-spin inline-block mb-4"></span>
      <h2 className="text-xl font-semibold text-[#2D1B3D]">Completing Sign In...</h2>
      <p className="text-sm text-[#2D1B3D]/60 mt-2 font-body">Please wait while we set up your session.</p>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E8C4B8]/30 max-w-md w-full sm:px-10">
        <Suspense fallback={
          <div className="text-center py-4 text-sm text-[#2D1B3D]/60 font-body">
            Loading session details...
          </div>
        }>
          <LoginSuccessHandler />
        </Suspense>
      </div>
    </div>
  );
}
