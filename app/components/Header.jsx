"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Layout, Menu, Row, Col, Button, Space, Tooltip, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import Navbar from "./Navbar";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { UserAuth } from "../context/AuthContext";
import Link from "next/link";

const Header = () => {
  const { user, googleSignIn, logOut } = UserAuth();

  const [loading, setLoading] = useState(true);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (
    <Layout.Header className="bg-white">
      <Row>
        <Col flex={4}>
          <Image src={"/logo.png"} alt="logo" width={64} height={64} />
        </Col>
        <Col flex={16}>
          <Navbar />
        </Col>
        <Col flex={4}>
          {loading ? null : !user ? (
            <Button type="primary" onClick={handleSignIn}>
              Log In
            </Button>
          ) : (
            <Row gutter={8}>
              <Col>
                <Tooltip title={user.displayName} placement="bottom">
                  <Link href={"/testAuthentication"}>
                    <Avatar
                      style={{ backgroundColor: "#f56a00" }}
                      size={"large"}
                    >
                      {user.displayName[0] + user.displayName.split(" ")[1][0]}
                    </Avatar>
                  </Link>
                </Tooltip>
              </Col>
              <Col>
                <Button
                  onClick={handleSignOut}
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                >
                  Sign Out
                </Button>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
