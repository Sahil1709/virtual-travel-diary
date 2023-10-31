import { useContext, createContext, useState, useEffect } from "react";
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"
import { auth, database } from "../firebase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        //! Handle firebase error user cancelled popup
        signInWithPopup(auth, provider);
    };

    const logOut = () => {
        signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // after signin create a user entry in users collection
            const docRef = doc(database, "users", currentUser?.uid);
            if (docRef == null) {
                setDoc(docRef, {
                    firstName: "",
                    lastName: "",
                    phone: "",
                    address: "",
                    zip: "",
                    displayName: currentUser?.displayName,
                });
                console.log('Success:');
            }

        });
        return () => unsubscribe();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, googleSignIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
};