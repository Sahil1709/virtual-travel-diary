import React from "react";
import { Button, Result } from "antd";
import { UserAuth } from "../context/AuthContext";

const Custom403 = () => {
  const { googleSignIn } = UserAuth();
  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={handleSignIn}>
          Try Logging in
        </Button>
      }
    />
  );
};
export default Custom403;
