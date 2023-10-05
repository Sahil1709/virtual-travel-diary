"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu } from "antd";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const itemsForReference = [
  {
    label: "Navigation One",
    key: "mail",
    icon: <MailOutlined />,
  },
  {
    label: "Navigation Two",
    key: "app",
    icon: <AppstoreOutlined />,
    disabled: true,
  },
  {
    label: "Navigation Three - Submenu",
    key: "SubMenu",
    icon: <SettingOutlined />,
    children: [
      {
        type: "group",
        label: "Item 1",
        children: [
          {
            label: "Option 1",
            key: "setting:1",
          },
          {
            label: "Option 2",
            key: "setting:2",
          },
        ],
      },
      {
        type: "group",
        label: "Item 2",
        children: [
          {
            label: "Option 3",
            key: "setting:3",
          },
          {
            label: "Option 4",
            key: "setting:4",
          },
        ],
      },
    ],
  },
  {
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        Navigation Four - Link
      </a>
    ),
    key: "alipay",
  },
];

const items = [
  {
    label: <Link href={"/"}>Homepage</Link>,
    key: "home",
  },
  {
    label: <Link href={"/testAuthentication"}>Test Authentication</Link>,
    key: "auth",
  },
  {
    label: <Link href={"/testDiaries"}>Test Diaries</Link>,
    key: "diaries",
  },
  //TODO: try using next/link here
  {
    label: <a href={"/testImages"}>Test Images</a>,
    key: "images",
  },
];

const Navbar = () => {
  const [current, setCurrent] = useState("mail");

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    //! on performing a full reload, selected key disappears
    <Menu
      onClick={onClick}
      items={items}
      selectedKeys={[current]}
      style={{ justifyContent: "center" }}
      mode="horizontal"
      defaultSelectedKeys={["home"]}
    />
  );
};

export default Navbar;
