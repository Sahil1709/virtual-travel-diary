"use client";
import React, { useEffect, useState } from "react";
import { getDoc, where, doc, getDocs, collection, setDoc, addDoc, query, deleteDoc } from "firebase/firestore";
import { database } from "@/app/firebase";
import Title from "antd/es/typography/Title";
import { useParams } from "next/navigation";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import Custom403 from "@/app/components/Custom403";
import { UserAuth } from "@/app/context/AuthContext";
import { Button, Select, List, Divider } from "antd";
import Typography from "antd/es/typography/Typography";

const Diary = () => {
    const params = useParams();
    const { user } = UserAuth();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const [currentCollaborators, setCurrentCollaborators] = useState([]);

    //todo: Make this a protected route
    const getUsers = async () => {
        const data = [];
        const querySnapshot = await getDocs(collection(database, "users"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            data.push({
                value: doc.id,
                label: doc.data().displayName,
            })
            console.log(doc.id, " => ", doc.data());
        });
        setOptions(data);
    }

    const handleChange = (value) => {
        console.log(value);
        setCollaborators(value);
    };

    const addCollaborator = async (diaryId, collaboratorId) => {
        //todo: add notifications
        const collaboratorsRef = collection(database, 'collaborators');

        // Check if a document with the same diaryId and collaboratorId already exists
        const duplicateQuery = query(collaboratorsRef, where('diaryId', '==', diaryId), where('collaboratorId', '==', collaboratorId));
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
            // A document with the same diaryId and collaboratorId already exists, handle the duplicate case as needed
            console.log('Duplicate collaborator entry found.');
            return;
        }

        await addDoc(collection(database, "collaborators"), {
            diaryId: diaryId,
            collaboratorId: collaboratorId,
        });
        console.log(`Successfullly added ${collaboratorId}`)
        getCollaborators();
    }

    const addCollaborators = (diaryId, collaborators) => {
        collaborators.forEach((collaborator) => {
            addCollaborator(diaryId, collaborator);
        })
    }

    const getCollaborators = async () => {
        const data = [];
        const q = query(
            collection(database, "collaborators"),
            where("diaryId", "==", params.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push(doc.data().collaboratorId);
        });
        setCurrentCollaborators(data);
    }

    const removeCollaborator = async (cId) => {
        // todo: get a document where collaboratorId = currentCollaborator id and diaryId = paramsId
        // delete that document
        const collaboratorsRef = collection(database, 'collaborators');

        const q = query(collaboratorsRef, where('diaryId', '==', params.id), where('collaboratorId', '==', cId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (collaboratorData) => {
            console.log(collaboratorData.data());
            const docId = collaboratorData.id;
            await deleteDoc(doc(collaboratorsRef, docId));
        })

        getCollaborators();
    }

    useEffect(() => {
        const getDocument = async () => {
            const docRef = doc(database, "diaries", params.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                //console.log("Document data:", docSnap.data());
                setDiary(docSnap.data());
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
            }
            setLoading(false);
        };
        getDocument();
        getUsers();
        getCollaborators();
    }, []);

    if (loading) return <Loading />

    if (!user) return <Custom403 />

    if (!diary) return <NotFound />

    return (
        <>
            <Title>Diary {params.id}</Title>
            <h1>Name: {diary.diaryName}</h1>
            <div>Location: {diary.location}</div>
            <div>Description: {diary.description}</div>
            <Select
                mode="tags"
                style={{
                    width: '100%',
                }}
                placeholder="Tags Mode"
                onChange={handleChange}
                options={options}
            />
            <Button onClick={() => addCollaborators(params.id, collaborators)}>Add Collaborators</Button>
            <Button onClick={() => console.log(currentCollaborators)}>TEst</Button>
            <List
                header={<Title level={3}>Users Collaborating on this diary :</Title>}
                bordered
                dataSource={currentCollaborators}
                //todo: change item to hold a list of objects 
                renderItem={(item) => (
                    <List.Item>
                        <Typography mark>{item}</Typography>
                        <Button type="primary" danger onClick={() => removeCollaborator(item)}>Remove</Button>
                    </List.Item>
                )}
            />


        </>
    );
}

export default Diary;
