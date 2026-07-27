"use client";
import Button from "@/components/ui/button/Button";
import React, { useActionState, useEffect } from "react";
import { loginWithGoogle } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(loginWithGoogle, null);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gunakan akun Google Anda untuk masuk ke sistem.
            </p>
          </div>
          <div>
            <form action={formAction}>
              <div className="space-y-6">
                {(state?.error || errorMsg) && (
                  <div className="p-3 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
                    {state?.error || errorMsg}
                  </div>
                )}
                
                <div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3"
                    size="sm"
                    disabled={isPending}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.6105 10.2393C19.6105 9.53034 19.5468 8.85043 19.4267 8.20019H10.0015V12.0577H15.3887C15.1561 13.3051 14.4449 14.3643 13.3855 15.0734V17.5752H16.6202C18.514 15.8344 19.6105 13.2751 19.6105 10.2393Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.0012 20.0003C12.7029 20.0003 14.966 19.1039 16.6231 17.5754L13.3884 15.0736C12.4907 15.6749 11.3414 16.0306 10.0012 16.0306C7.40822 16.0306 5.21639 14.2801 4.4357 11.9336H1.09033V14.5262C2.73145 17.7858 6.10444 20.0003 10.0012 20.0003Z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.43283 11.9332C4.23023 11.327 4.11603 10.6763 4.11603 9.99988C4.11603 9.32341 4.23023 8.67272 4.43283 8.06653V5.47391H1.09117C0.412461 6.82845 0.0224609 8.36636 0.0224609 9.99988C0.0224609 11.6334 0.412461 13.1713 1.09117 14.5258L4.43283 11.9332Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.0012 3.9696C11.4707 3.9696 12.7876 4.47547 13.8263 5.46747L16.6922 2.60155C14.9624 0.989711 12.6993 0 10.0012 0C6.10444 0 2.73145 2.21447 1.09033 5.47385L4.432 8.06646C5.21639 5.71997 7.40822 3.9696 10.0012 3.9696Z"
                        fill="#EA4335"
                      />
                    </svg>
                    {isPending ? "Membuka Google..." : "Sign in with Google"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
