"use client"
import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { UploadOutlined } from '@ant-design/icons';
import { Button, Image, List, message, Upload, Row, Col } from 'antd';
import { Progress, Space, Spin } from 'antd';
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons"
import { UserAuth } from "../context/AuthContext";
import Custom403 from "../components/Custom403";
import Loading from "../loading";

// Get a reference to the storage service, which is used to create references in your storage bucket
import { storage } from "../firebase";
import Title from "antd/es/typography/Title";

const TestImages = () => {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0, // Minimum number of decimal places
        maximumFractionDigits: 2, // Maximum number of decimal places
    });
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState(null);
    const [downloadURLSofCurrentUser, setdownloadURLSofCurrentUser] = useState([]);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

        };
        checkAuthentication();
    }, [user]);
    useEffect(() => {
        if (user) {
            const listRef = ref(storage, user.uid);
            const data = [];
            // Find all the prefixes and items.
            listAll(listRef)
                .then((res) => {
                    res.items.forEach((itemRef) => {
                        getDownloadURL(itemRef).then((url) => {
                            console.log(url)
                            data.push(url);

                            setdownloadURLSofCurrentUser((prevDownloadURLSofCurrentUser) => [
                                ...prevDownloadURLSofCurrentUser,
                                url,
                            ]);
                        }).catch((error) => console.log(error))
                    });
                }).catch((error) => {
                    console.log(error)
                });
        }
        setLoading(false);
    }, [user, storage])


    // const props = {
    // name: 'file',
    //   // action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    //   // headers: {
    //   //   authorization: 'authorization-text',
    //   // },
    //   onChange(info) {
    //     if (info.file.status !== 'uploading') {
    //       console.log(info.file, info.fileList);
    //     }
    //     if (info.file.status === 'done') {
    //       message.success(`${info.file.name} file uploaded successfully`);
    //     } else if (info.file.status === 'error') {
    //       message.error(`${info.file.name} file upload failed.`);
    //     }
    //   },
    // };

    const handleChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const storageRef = ref(storage, user.uid + "/" + image.name);
        //const uploadTask = storageRef.child(image.name).put(image);

        const metadata = {
            contentType: 'image/jpeg',
        };

        // 'file' comes from the Blob or File API
        // uploadBytes(storageRef, image, metadata).then((snapshot) => {
        //   console.log('Uploaded a blob or file!');
        // });

        const uploadTask = uploadBytesResumable(storageRef, image, metadata);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(formatter.format(progress));
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        console.log("LogIn First")
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        console.log("UPload cancelled")
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        console.log(error)
                        break;
                }
            },
            () => {
                //const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setDownloadURL(downloadURL);
                });
                //! try another way to perform reload
                location.reload();
            }
        );
    };



    const getAllDownloadUrls = (e) => {
        e.preventDefault();
        // Create a reference under which you want to list
        const listRef = ref(storage, user.uid);
        const data = [];
        // Find all the prefixes and items.
        listAll(listRef)
            .then((res) => {
                res.prefixes.forEach((folderRef) => {
                    // All the prefixes under listRef.
                    // You may call listAll() recursively on them.
                    console.log(folderRef)
                });
                res.items.forEach((itemRef) => {
                    // All the items under listRef.
                    console.log(itemRef)
                    getDownloadURL(itemRef).then((url) => {
                        console.log(url)
                        data.push(url);
                        setdownloadURLSofCurrentUser((prevDownloadURLSofCurrentUser) => [
                            ...prevDownloadURLSofCurrentUser,
                            url,
                        ]);
                    }).catch((error) => console.log(error))
                });
            }).catch((error) => {
                // Uh-oh, an error occurred!
                console.log(error)
            });

        //setdownloadURLSofCurrentUser(data);
    }

    const test = () => {
        console.log(downloadURLSofCurrentUser)
    }

    const getFileName = (url) => {
        const filename = new URL(url).pathname.split("/").pop();
        const filenameWithoutQueryParametersAndHash = filename.split("?")[0].split("#")[0];
        const filenameParts = filename.split("%2F");
        return filenameParts[1];
    }

    const handleDelete = (url) => {

        const filename = new URL(url).pathname.split("/").pop();
        const filenameWithoutQueryParametersAndHash = filename.split("?")[0].split("#")[0];
        const filenameParts = filename.split("%2F");
        console.log(filenameParts[1])

        // Create a reference to the file to delete
        const desertRef = ref(storage, user.uid + '/' + filenameParts[1]);

        // Delete the file
        deleteObject(desertRef).then(() => {
            // File deleted successfully
        }).catch((error) => {
            // Uh-oh, an error occurred!
        });
        location.reload()
    }

    const handleDownload = (url) => {
        //TODO Image not downloading
        fetch(url).then((res) => res.blob()).then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image.png'; //TODO: Change this
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })

    }

    if (loading) return <Loading />

    if (!user) return <Custom403 />

    return (
        <div>

            <Title>{user && user.displayName}'s Images </Title>
            <input type="file" onChange={handleChange} />

            <Button icon={<UploadOutlined />} onClick={handleSubmit}> Click to Upload</Button>

            {progress > 0 && <Progress type="circle" percent={progress} />}

            {downloadURL && <Image src={downloadURL} width={200} />}
            {/* <div><Button onClick={getAllDownloadUrls}>
                Get all download urls of current user
            </Button></div> */}
            <Row>
                {downloadURLSofCurrentUser ? downloadURLSofCurrentUser.map((url) =>
                    <Col key={url}>
                        <Image src={url} width={200} download /> <br />
                        <Button onClick={() => handleDelete(url)} icon={<DeleteOutlined />} type="primary" danger shape="round"></Button>
                        <Button type="primary" onClick={() => handleDownload(url)} icon={<DownloadOutlined />} >
                            Download
                        </Button>
                    </Col>) : <Title>Nothing to display</Title>}
            </Row>

        </div>
    );
};

export default TestImages;