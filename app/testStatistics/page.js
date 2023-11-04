"use client"
import React, { useEffect, useState } from 'react';
import { LikeOutlined, ArrowUpOutlined, ArrowDownOutlined, FormOutlined, ReadOutlined, RocketOutlined, CommentOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Col, Row, Statistic, Card, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../firebase';
import { UserAuth } from '../context/AuthContext';
import Loading from '../loading';
import Custom403 from '../components/Custom403';

const getUserStatistics = async (userId) => {
    const diariesRef = collection(database, 'diaries');
    const commentsRef = collection(database, 'comments');
    const collaboratorsRef = collection(database, 'collaborators');
    const diaries = [];

    // Fetch number of diaries created by the user
    const diariesQuery = query(diariesRef, where('userId', '==', userId));
    const diariesSnapshot = await getDocs(diariesQuery);
    diariesSnapshot.forEach((doc) => {
        diaries.push({ id: doc.id, ...doc.data() });
    });
    const numberOfDiaries = diariesSnapshot.size;

    // Fetch total comments created by the user
    const commentsQuery = query(commentsRef, where('userId', '==', userId));
    const commentsSnapshot = await getDocs(commentsQuery);
    const totalComments = commentsSnapshot.size;

    // Fetch total comments user have received in all the diaries created so far
    let totalCommentsForUser = 0;
    for (const diary of diaries) {
        const commentsQuery = query(commentsRef, where('diaryId', '==', diary.id));
        const commentsSnapshot = await getDocs(commentsQuery);
        totalCommentsForUser += commentsSnapshot.size;
    }

    // Fetch number of unique countries visited
    const uniqueCountries = new Set();
    diariesSnapshot.forEach((diary) => {
        uniqueCountries.add(diary.data().location.toLowerCase());
    });
    const numberOfCountriesVisited = uniqueCountries.size;

    // Fetch number of diaries user is collaborating on
    const collaboratorsQuery = query(collaboratorsRef, where('collaboratorId', '==', userId));
    const collaboratorsSnapshot = await getDocs(collaboratorsQuery);
    const numberOfCollaborators = collaboratorsSnapshot.size;

    // Fetch no. of people collaborating on diaries created by user
    let totalCollaborators = 0;
    for (const diary of diaries) {
        const collaboratorsQuery = query(collaboratorsRef, where('diaryId', '==', diary.id));
        const collaboratorsSnapshot = await getDocs(collaboratorsQuery);
        totalCollaborators += collaboratorsSnapshot.size;
    }

    return {
        numberOfDiaries,
        totalComments,
        numberOfCountriesVisited,
        numberOfCollaborators,
        totalCommentsForUser,
        totalCollaborators,
    };
};


const TestStatistics = () => {
    const { user } = UserAuth();
    const userId = user?.uid;
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    useEffect(() => {
        // Fetch and set user statistics
        if (user) {
            getUserStatistics(userId).then((stats) => {
                setStatistics(stats);
                setLoading(false);
            });
        }

    }, [userId, statistics]);

    if (!user) return <Custom403 />

    if (!statistics || loading) return <Loading />

    return (
        <div className='m-10'>
            <Title>View your stats: 👀</Title>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Number of diaries created</div>}
                            value={statistics.numberOfDiaries}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<ReadOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Total Comments created by you</div>}
                            value={statistics.totalComments}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<CommentOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Number of Countries Visited</div>}
                            value={statistics.numberOfCountriesVisited}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<RocketOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Number of Diaries you're collaborating on</div>}
                            value={statistics.numberOfCollaborators}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<FormOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Number of Collaborators you've added</div>}
                            value={statistics.totalCollaborators}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<UserSwitchOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card >
                        <Statistic
                            title={<div className='font-bold text-zinc-900'>Total Comments you've acquired </div>}
                            value={statistics.totalCommentsForUser}
                            valueStyle={{
                                color: '#27477a',
                                fontSize: "32px",
                                fontWeight: "bolder",
                                textAlign: "center"
                            }}
                            prefix={<LikeOutlined />}
                            suffix=""
                        />
                    </Card>
                </Col>

            </Row>

        </div>
    );
}

export default TestStatistics;