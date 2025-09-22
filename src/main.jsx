import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./store";
import { MessageProvider } from "./components/common/message";
import "antd/dist/reset.css";
import "./index.css";
import router from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              // Seed Token，影响范围大
              colorPrimary: "#2761f3",
              borderRadius: 8,

              // 派生变量，影响范围小
              // colorBgContainer: "#f6ffed",
            },
          }}
        >
          <MessageProvider>
            <RouterProvider router={router} />
          </MessageProvider>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
