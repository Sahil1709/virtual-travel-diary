"use client";
import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, List, Modal, Row, Col } from "antd";
import { useRouter, usePathname } from 'next/navigation';
import { UserAuth } from "@/app/context/AuthContext";
import firebase from "firebase/app";
import { database } from "../firebase";
import Custom403 from "../components/Custom403";
import Loading from "../loading";
import "firebase/firestore";
import {
    doc,
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    deleteDoc,
    query,
    where,
    setDoc,
} from "firebase/firestore";
import Link from "next/link";

const TestDiaries = () => {
    const pathname = usePathname();
    const { user } = UserAuth();
    const [form] = Form.useForm();
    const [diaries, setDiaries] = useState([]);
    const [visible, setVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);
    useEffect(() => {
        if (user) {
            // Fetch diaries for the current user
            const q = query(
                collection(database, "diaries"),
                where("userId", "==", user.uid)
            );

            //const querySnapshot = getDocs(q);

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push({ ...doc.data(), id: doc.id });
                });
                setDiaries(data);
            });

            return () => unsubscribe();
        }
    }, [user, database]);

    const onFinish = async (values) => {
        if (editId) {
            // Update existing diary entry
            // await database.collection("diaries").doc(editId).update(values);
            await setDoc(doc(database, "diaries", editId), {
                ...values,
                userId: user.uid,
            })
            setEditId(null);
        } else {
            // Add a new diary entry
            await addDoc(collection(database, "diaries"), {
                ...values,
                userId: user.uid,
            });
            //   collection("diaries")
            //     .add({ ...values, userId: user.uid });
        }
        form.resetFields();
        setVisible(false);
    };

    const onDelete = async (id) => {
        await deleteDoc(doc(database, "diaries", id));
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
            <h1>{user && user.displayName}'s Diaries</h1>
            <Button type="primary" onClick={() => setVisible(true)}>
                Add Diary Entry
            </Button>
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
                //TODO: Implement a grid here instead of list
                dataSource={diaries}
                renderItem={(diary) => (
                    <List.Item style={{ justifyContent: "center" }}>
                        <Card
                            title={<Link href={pathname + '/' + diary.id} className="text-black font-bold">{diary.diaryName}</Link>}
                            extra={
                                <>
                                    <Button type="link" onClick={() => onEdit(diary)}>
                                        Edit
                                    </Button>
                                    <Button type="link" onClick={() => onDelete(diary.id)}>
                                        Delete
                                    </Button>
                                </>
                            }
                        >
                            <p>Location: {diary.location}</p>
                            <p>Description: {diary.description}</p>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TestDiaries;
