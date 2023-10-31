"use client"
// import { useSession } from "next-auth/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../firebase";
import { Button } from "antd";


const test = async () => {
    //const q = query(collection(db, "cities"), where("capital", "==", true));

    const querySnapshot = await getDocs(collection(database, "users"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
}

const TestCollaborators = async () => {
    // const { data: session } = useSession();


    //const user = await auth.getUser(uid);
    const users = [];
    return (
        <div>
            <Button onClick={test}>TEST</Button>
            <h1>List of all users</h1>
            <ul>
                {users?.map((user) => (
                    <li key={user.uid}>{user.email}</li>
                ))}
            </ul>
        </div>
    );
}

export default TestCollaborators;