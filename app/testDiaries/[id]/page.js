"use client";
import React, { useEffect, useState } from "react";
import { getDoc, where, doc } from "firebase/firestore";
import { database } from "@/app/firebase";
import Title from "antd/es/typography/Title";
import { useParams } from "next/navigation";
import { Button } from "antd";

const Diary = () => {
    const params = useParams();
    const [diary, setDiary] = useState({});

    useEffect(() => {
        const getDocument = async () => {
            const docRef = doc(database, "diaries", params.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                setDiary(docSnap.data());
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
            }
        };
        getDocument();
    }, []);

    return (
        <>
            <Title>Diary {params.id}</Title>
            <h1>Name: {diary.diaryName}</h1>
            <div>Location: {diary.location}</div>
            <div>Description: {diary.description}</div>
        </>
    );
}

export default Diary;
