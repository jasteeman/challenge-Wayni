import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from "react";

const Loader: React.FC = () => {

    return (
        <>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 50 }}/>}  fullscreen />
        </>
    );
};

export default Loader