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
import { Button, Select, List, Divider, FloatButton } from "antd";
import { ShareAltOutlined, CopyOutlined, WhatsAppOutlined, FacebookOutlined } from '@ant-design/icons';
import Typography from "antd/es/typography/Typography";

const Diary = () => {
    const params = useParams();
    const pathname = usePathname();
    const { user } = UserAuth();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const [currentCollaborators, setCurrentCollaborators] = useState([]);
    const [collaboratorDetails, setCollaboratorDetails] = useState([]);

    const currentUrl = process.env.NEXT_PUBLIC_DOMAIN_NAME + pathname;

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
        //todo: user can't add himself as a collaborator
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
        getCollaboratorDetails(data)
    }

    const getCollaboratorDetails = async (collaboratorIds) => {
        console.log(collaboratorIds)
        const data = [];
        collaboratorIds.forEach(async (collaboratorId) => {
            console.log(collaboratorId);
            const docRef = doc(database, "users", collaboratorId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                data.push({ ...docSnap.data(), id: docSnap.id });
            } else {
                console.log("No such document!");
            }
            setCollaboratorDetails(data);
        });
    }

    const removeCollaborator = async (cId) => {
        //!BUG: when the collaborator being removed is the last one, ui doesn't update
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

    const copyToClipboard = () => {
        console.log(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}${pathname}`)
        navigator.clipboard.writeText(currentUrl).then(() => {
            console.log("Copied")
        });
    };

    const shareOnWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`);
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`);
    };

    if (loading) return <Loading />

    if (!user) return <Custom403 />

    if (!diary) return <NotFound />

    return (
        <>
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{
                    right: 24,
                }}
                icon={<ShareAltOutlined />}
                tooltip={"Share"}
            >
                <FloatButton onClick={shareOnFacebook} icon={<FacebookOutlined />} tooltip={"Facebook"} />
                <FloatButton onClick={shareOnWhatsApp} icon={<WhatsAppOutlined />} tooltip={"WhatsApp"} />
                <FloatButton onClick={copyToClipboard} icon={<CopyOutlined />} tooltip={"Copy To Clipboard!"} />

            </FloatButton.Group>
            {/* <FloatButton.Group
                trigger="hover"
                type="primary"
                style={{
                    right: 94,
                }}
                icon={<CustomerServiceOutlined />}
            >
                <FloatButton />
                <FloatButton icon={<CommentOutlined />} />
            </FloatButton.Group> */}


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
                placeholder="Tags Mode"
                onChange={handleChange}
                options={options}
            />
            <Button onClick={() => addCollaborators(params.id, collaborators)}>Add Collaborators</Button>
            <Button onClick={() => console.log(collaboratorDetails)}>TEst</Button>
            <List
                header={<Title level={3}>Users Collaborating on this diary :</Title>}
                bordered
                dataSource={collaboratorDetails}
                //todo: change item to hold a list of objects 
                renderItem={(item) => (
                    <List.Item>
                        <Typography mark>{item.displayName}</Typography>
                        <Button type="primary" danger onClick={() => removeCollaborator(item.id)}>Remove</Button>
                    </List.Item>
                )}
            />

            <Title level={3}>USER Comment SECTION</Title>


        </>
    );
}

export default Diary;
