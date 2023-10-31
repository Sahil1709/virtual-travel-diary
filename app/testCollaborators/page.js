"use client"
// import { useSession } from "next-auth/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../firebase";
import { Button } from "antd";


const TestCollaborators = async () => {
    const users = []
    return (
        <div>
            <Button onClick={() => console.log("test")}>TEST</Button>
            <h1>Diaries that You're Collaborating on:</h1>
            <ul>
                {users?.map((user) => (
                    <li key={user.uid}>{user.email}</li>
                ))}
            </ul>
        </div>
    );
}

export default TestCollaborators;