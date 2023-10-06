"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Spin, notification } from "antd";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { database } from "../firebase";
import Title from "antd/es/typography/Title";
import { UserAuth } from "../context/AuthContext";
import Custom403 from "../components/Custom403";

const TestAuthentication = () => {
    const { user } = UserAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setLoading(false);
            setProfileDataFromDatabase();
        };
        checkAuthentication();
    }, [user]);

    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        zip: "",
    });

    // open notifications functions
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (type, message, description) => {
        // Other types are success, info, warning, error
        api[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    // * user edit porfile functions
    const setProfileDataFromDatabase = async () => {
        if (user) {
            const docRef = doc(database, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                const d = docSnap.data(); //just for convinience, else we had to write docSnap.data() everywhere
                setProfileData({
                    firstName: d.firstName,
                    lastName: d.lastName,
                    phone: d.phone,
                    address: d.address,
                    zip: d.zip,
                });
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
                setProfileData({
                    firstName: "",
                    lastName: "",
                    phone: "",
                    address: "",
                    zip: "",
                })
            }


        }
    };

    form.setFieldsValue(profileData);
    const onFinish = (values) => {
        const docRef = doc(database, "users", user.uid);
        setDoc(docRef, {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            address: profileData.address,
            zip: profileData.zip,
        });
        openNotification("success", "Success", "Your profile is updated successfully!");
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        openNotification("error", "Error", "Please fill the form correctly.");
        console.log('Failed:', errorInfo);
    };

    if (loading) return <div>Loading ...</div>

    if (!user) return <Custom403 />

    return (
        <>
            {contextHolder}
            <Title >Welcome {user.displayName}</Title>

            <Form form={form} name="basic"
                labelCol={{
                    span: 8,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 600,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your first Name!',
                        },
                    ]}
                >
                    <Input onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                    } />
                </Form.Item>
                <Form.Item label="Last Name"
                    name="lastName"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Last Name!',
                        },
                    ]}>
                    <Input onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                    } />
                </Form.Item>

                <Form.Item
                    label="Phone No."
                    name="phone"

                    rules={[
                        {
                            required: true,
                            message: 'Please input your phone number!',
                            pattern: new RegExp(/^[0-9]+$/),
                        },
                    ]}
                >
                    <Input maxLength={12} onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                    } />
                </Form.Item>

                <Form.Item
                    label="Address"
                    name="address"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your address!',
                        },
                    ]}
                >
                    <Input onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                    } />
                </Form.Item>

                <Form.Item
                    label="Zip Code"
                    name="zip"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your zip code!',
                        },
                    ]}
                >
                    <Input onChange={(e) =>
                        setProfileData({ ...profileData, zip: e.target.value })
                    } />
                </Form.Item>



                <Form.Item
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    )



}

export default TestAuthentication;