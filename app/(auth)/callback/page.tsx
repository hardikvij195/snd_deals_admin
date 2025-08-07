"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from "@/lib/supabaseBrowser"; // Import supabaseBrowser
import { Loader } from "lucide-react";
import { onAuthenticatedUser } from "@/app/actions/auth"; // Assuming this is your function
import { useDispatch } from "react-redux"; // Import if you use Redux

const AuthCallbackPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch(); // Use useDispatch if needed for Redux

    useEffect(() => {
        const handleAuthentication = async () => {
            const { data: { session } } = await supabaseBrowser.auth.getSession();
            console.log("[callback] session:", session);

            if (!session) {
                router.replace("/sign-in");
                return;
            }

            // Your existing logic to handle the authenticated user
            // Make sure onAuthenticatedUser is a client-side function or an API call
            const result = await onAuthenticatedUser(session.access_token); 
            console.log("[callback] server result:", result);

            if (result && result.status === 200) {
                router.replace("/dashboard");
            } else {
                router.replace("/");
            }
            setIsLoading(false);
        };

        handleAuthentication();
    }, [router, dispatch]);

    return (
        <div className='flex h-screen w-full items-center justify-center'>
            <div className="flex flex-col items-center gap-2">
                <Loader className='h-10 w-10 animate-spin text-primary' />
                {isLoading ? (
                    <>
                        <h3 className="text-xl font-bold">Authenticating...</h3>
                        <p>Please wait while we verify your credentials</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold">Redirecting...</h3>
                        <p>Please wait while we prepare your experience</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallbackPage;