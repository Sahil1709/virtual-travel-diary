"use client";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { database } from "../firebase";
import { UserAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Input, Button, List, Typography } from "antd";
//import Typography from "antd/es/typography/Typography";
import Title from "antd/es/typography/Title";
const { Text } = Typography;

// Function to get comments for a diary
// const getCommentsForDiary = async (diaryId) => {
//   const commentsRef = collection(database, "comments");
//   const q = query(commentsRef, where("diaryId", "==", diaryId));
//   const querySnapshot = await getDocs(q);

//   const comments = [];
//   querySnapshot.forEach(async (docu) => {
//     //comments.push({ id: doc.id, ...docu.data() });
//     // here also get the displayName of user with the userId from the users collection
//     const userId = docu.data().userId;
//     const userRef = doc(database, "users", userId);
//     const userDoc = await getDoc(userRef);
//     if (userDoc.exists()) {
//       const user = userDoc.data();
//       const formattedTimestamp = new Date(
//         docu.data().timestamp.toDate()
//       ).toLocaleString();

//       comments.push({
//         id: docu.id,
//         text: docu.data().text,
//         userDisplayName: user.displayName,
//         commentTimestamp: formattedTimestamp,
//         ...docu.data(),
//       });
//     }
//   });

//   return comments;
// };

const getCommentsForDiary = async (diaryId) => {
  const commentsRef = collection(database, "comments");
  const q = query(commentsRef, where("diaryId", "==", diaryId));
  const querySnapshot = await getDocs(q);

  const comments = [];

  for (const docu of querySnapshot.docs) {
    const commentData = docu.data();
    const userId = commentData.userId;

    // Fetch user information from the 'users' collection
    const userRef = doc(database, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const user = userDoc.data();
      const formattedTimestamp = new Date(
        commentData.timestamp.toDate()
      ).toLocaleString();

      comments.push({
        id: docu.id,
        text: commentData.text,
        userDisplayName: user.displayName,
        commentTimestamp: formattedTimestamp,
      });
    }
  }

  comments.sort(
    (a, b) => new Date(b.commentTimestamp) - new Date(a.commentTimestamp)
  );

  return comments;
};

// Function to add a comment to a diary
const addCommentToDiary = async (diaryId, userId, text) => {
  const commentsRef = collection(database, "comments");
  await addDoc(commentsRef, {
    diaryId: diaryId,
    userId: userId,
    text: text,
    timestamp: serverTimestamp(),
  });
};

const CommentSection = ({ diaryId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const { user } = UserAuth();
  const userId = user.uid;

  useEffect(() => {
    // Fetch and set comments for the diary
    getCommentsForDiary(diaryId).then((comments) => {
      setComments(comments);
    });
  }, []);

  const handleAddComment = (text) => {
    // Add a new comment to the diary
    addCommentToDiary(diaryId, userId, text).then(() => {
      // Refresh comments after adding a new comment
      getCommentsForDiary(diaryId).then((comments) => {
        setComments(comments);
      });
    });
  };

  return (
    <div>
      {/* Diary content */}
      <Title level={3}>Users Comments Section --</Title>
      <Input
        id="commentText"
        rows={4}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={() => handleAddComment(text)}>Add comment</Button>
      {/* {comments.map((comment) => (
        <li key={comment.id}>
          {comment.text} created by {comment.userDisplayName} at{" "}
          {comment.commentTimestamp}
        </li>
      ))} */}

      <List
        header={<Title level={4}>Comments: </Title>}
        bordered
        dataSource={comments}
        renderItem={(item) => (
          <List.Item>
            <Text strong>{item.text}</Text> <br />
            Commented by {item.userDisplayName}
            <div className="float-right">at {item.commentTimestamp}</div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommentSection;
