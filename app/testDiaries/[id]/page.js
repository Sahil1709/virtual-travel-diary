"use client";
import React, { useEffect, useState } from "react";
import { getDoc, where, doc, getDocs, collection, setDoc, addDoc, query, deleteDoc } from "firebase/firestore";
import { database } from "@/app/firebase";
import Title from "antd/es/typography/Title";
import { useParams, usePathname } from "next/navigation";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import Custom403 from "@/app/components/Custom403";
import { UserAuth } from "@/app/context/AuthContext";
import { Button, Select, List, Divider, FloatButton, notification } from "antd";
import { ShareAltOutlined, CopyOutlined, WhatsAppOutlined, FacebookOutlined } from '@ant-design/icons';
import Typography from "antd/es/typography/Typography";
import CommentSection from "@/app/components/CommetSection";

const Diary = () => {
    const params = useParams();
    const pathname = usePathname();
    const { user } = UserAuth();
    const [api, contextHolder] = notification.useNotification();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const [currentCollaborators, setCurrentCollaborators] = useState([]);
    const [collaboratorDetails, setCollaboratorDetails] = useState([]);

    const currentUrl = process.env.NEXT_PUBLIC_DOMAIN_NAME + pathname;

    const getUsers = async () => {
        const data = [];
        const querySnapshot = await getDocs(collection(database, "users"));
        querySnapshot.forEach((doc) => {
            // doc.id is user.uid
            if (doc.id != user.uid) {
                data.push({
                    value: doc.id,
                    label: doc.data().displayName,
                })
            }

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
            openNotification("error", "Error!", "Duplicate collaborator entry found.")
            return;
        }

        await addDoc(collection(database, "collaborators"), {
            diaryId: diaryId,
            collaboratorId: collaboratorId,
        });
        console.log(`Successfullly added ${collaboratorId}`)
        openNotification("success", "Success!", "Successfully added new collaborator")
        getCollaborators();
    }

    const addCollaborators = (diaryId, collaborators) => {
        //!BUG: when adding all collaborators ui shows only one is added
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
        getCollaboratorDetails(data);
    }

    const getCollaboratorDetails = async (collaboratorIds) => {
        console.log(collaboratorIds)
        const data = [];
        const namesData = [];
        collaboratorIds.forEach(async (collaboratorId) => {
            console.log(collaboratorId);
            const docRef = doc(database, "users", collaboratorId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                data.push({ ...docSnap.data(), id: docSnap.id });
                namesData.push(docSnap.data().displayName)
            } else {
                console.log("No such document!");
            }
            setCollaboratorDetails(data);
            setDisplayNames(namesData);
        });
        setCollaboratorDetails(data);
    }

    const removeCollaborator = async (cId) => {
        const collaboratorsRef = collection(database, 'collaborators');

        const q = query(collaboratorsRef, where('diaryId', '==', params.id), where('collaboratorId', '==', cId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (collaboratorData) => {
            console.log(collaboratorData.data());
            const docId = collaboratorData.id;
            await deleteDoc(doc(collaboratorsRef, docId));
            openNotification("success", "Success!", "Collaborator Removed.")
        })

        getCollaborators();
    }

    const openNotification = (type, message, description) => {
        // Other types are success, info, warning, error
        api[type]({
            message,
            description,
            placement: "topRight",
        });
    };


    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

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
        if (user) getUsers();
        getCollaborators();
    }, [user, collaborators]);

    const copyToClipboard = () => {
        console.log(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}${pathname}`)
        navigator.clipboard.writeText(currentUrl).then(() => {
            console.log("Copied")
            openNotification("info", "Copied to clipboard!", "Now you can share this diary link to your friends 😊")
        });
    };

    const shareOnWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`);
    };

    if (loading) return <Loading />

    if (!user) return <Custom403 />

    if (!diary) return <NotFound />

    return (
        <>
            {contextHolder}
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{
                    right: 24,
                }}
                icon={<ShareAltOutlined />}
                tooltip={"Share"}
            >

                <FloatButton onClick={shareOnWhatsApp} icon={<WhatsAppOutlined />} tooltip={"WhatsApp"} />
                <FloatButton onClick={copyToClipboard} icon={<CopyOutlined />} tooltip={"Copy To Clipboard!"} />

            </FloatButton.Group>

            <Title>Diary {params.id}</Title>
            <h1>Name: {diary.diaryName}</h1>
            <div>Location: {diary.location}</div>
            <div>Description: {diary.description}</div>
            {/* // todo: Set default selected users to users collaborating on this diary */}
            <Select
                mode="tags"
                style={{
                    width: '100%',
                }}
                placeholder="Select Collaborators"
                onChange={handleChange}
                options={options}
            />
            <Button onClick={() => addCollaborators(params.id, collaborators)}>Add Collaborators</Button>
            <Button onClick={() => console.log(collaboratorDetails)}>TEst</Button>
            <List
                header={<Title level={3}>Users Collaborating on this diary :</  Title>}
                bordered
                dataSource={collaboratorDetails}
                renderItem={(item) => (
                    <List.Item>
                        <Typography mark>{item.displayName}</Typography>
                        <Button type="primary" danger onClick={() => removeCollaborator(item.id)}>Remove</Button>
                    </List.Item>
                )}
            />

            <CommentSection diaryId={params.id} />

        </>
    );
}

export default Diary;
