"use client";
import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";

const TestAuthentication = () => {
    const { user, googleSignIn, logOut } = UserAuth();

    const [loading, setLoading] = useState(true);

    const handleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    if (loading) return <div>Loading ...</div>


    return <>
        {!user ? (
            <>
                <button className="btn" onClick={handleSignIn}>
                    Log In
                </button>
                <div>You must be logged in to view your name!</div>
            </>

        ) : (
            <>
                <button onClick={handleSignOut}>Sign Out</button>
                <div>Welcome {user.displayName}</div>
            </>
        )
        }
    </>

}

export default TestAuthentication;