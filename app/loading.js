import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);
const Loading = () =>
    <div className="text-center pt-20">
        <Spin indicator={antIcon} tip="Loading . . ." size='large'><div /></Spin>
    </div>

export default Loading;