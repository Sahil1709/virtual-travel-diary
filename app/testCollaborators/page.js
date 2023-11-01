"use client"
// import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { database } from "../firebase";
import { Button, List, Card, Modal, Form, Input } from "antd";
import { UserAuth } from "../context/AuthContext";
import Loading from "../loading";
import Custom403 from "../components/Custom403";

const TestCollaborators = async () => {
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);
    const [currentDiaryIds, setcurrentDiaryIds] = useState([]);
    const [diaries, setDiaries] = useState([]);
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    useEffect(() => {
        if (user) getDiaryIds()
    }, [user]);

    const getDiaryIds = async () => {
        const data = [];
        const q = query(collection(database, "collaborators"), where("collaboratorId", "==", user.uid))
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push(doc.data().diaryId);
        });
        setcurrentDiaryIds(data);
        getDiaries(data);
    }

    const getDiaries = async (diaryIds) => {
        console.log(diaryIds)
        const data = [];
        // get each diary id and append it to diaries
        diaryIds.forEach(async (diaryId) => {
            console.log(diaryId);
            const docRef = doc(database, "diaries", diaryId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                data.push({ ...docSnap.data(), id: docSnap.id });
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
            }
            setDiaries(data);
        });

    }

    const removeCollaborator = async (diaryId) => {
        //!BUG: when the diary being removed is the last one, ui doesn't update
        //! it goes away from currentDiaryIds though.
        //! after complete reload everything works fine
        const collaboratorsRef = collection(database, 'collaborators');

        const q = query(collaboratorsRef, where('diaryId', '==', diaryId), where('collaboratorId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (collaboratorData) => {
            console.log(collaboratorData.data());
            const docId = collaboratorData.id;
            await deleteDoc(doc(collaboratorsRef, docId));
        })

        getDiaryIds();
    }

    const onFinish = async (values) => {
        //!after diary edited not instantly reflecting in ui
        if (editId) {
            // Update existing diary entry
            // await database.collection("diaries").doc(editId).update(values);
            await setDoc(doc(database, "diaries", editId), {
                ...values,
                //userId: user.uid,

            }, { merge: true })
            setEditId(null);
        }
        form.resetFields();
        setVisible(false);
    };

    const onEdit = (diary) => {
        setEditId(diary.id);
        form.setFieldsValue(diary);
        setVisible(true);
    };

    if (loading) return <Loading />

    if (!user) return <Custom403 />

    return (
        <div>
            <h1>Diaries that You're Collaborating on:</h1>
            <Button onClick={getDiaries}>TESt</Button>
            <Button onClick={() => console.log(diaries)}>Test2</Button>
            <ul>
                {currentDiaryIds?.map((diaryId) => (
                    <>
                        <li key={diaryId}>{diaryId}</li>
                        <Button danger type="primary" onClick={() => removeCollaborator(diaryId)}>Don't want to collaborate anymore</Button>
                    </>
                ))}
            </ul>

            <Modal
                title={editId ? "Edit Diary Entry" : "Add Diary Entry"}
                visible={visible}
                onOk={form.submit}
                onCancel={() => {
                    form.resetFields();
                    setEditId(null);
                    setVisible(false);
                }}
            >
                <Form form={form} onFinish={onFinish}>
                    <Form.Item name="diaryName" label="Diary Name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="location" label="Location">
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editId ? "Update" : "Add"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <List
                dataSource={diaries}
                renderItem={(diary) => (
                    <List.Item style={{ justifyContent: "center" }}>
                        <Card
                            title={<Link href={'/testDiaries/' + diary.id} className="text-black font-bold">{diary.diaryName}</Link>}
                            extra={
                                <>
                                    <Button type="link" onClick={() => onEdit(diary)}>
                                        Edit
                                    </Button>

                                </>
                            }
                        >
                            <p>Location: {diary.location}</p>
                            <p>Description: {diary.description}</p>
                            <Button danger type="primary" onClick={() => removeCollaborator(diary.id)}>Don't want to collaborate anymore</Button>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}

export default TestCollaborators;