import React from 'react';
import { ReadOutlined } from '@ant-design/icons';

/**
 * Logo图标组件
 * @param {Object} props - 组件属性
 * @param {number} props.fontSize - 图标大小，默认20px
 */
const LogoIcon = ({ fontSize = 20 }) => {
  return (
    <div
      style={{
        padding: '8px 8px',
        backgroundColor: 'oklch(.546 .245 262.881)',
        borderRadius: 10,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ReadOutlined style={{ color: '#fff', fontSize }} />
    </div>
  );
};

export default LogoIcon;