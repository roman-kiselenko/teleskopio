import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLocalKey, setLocalKey, delLocalKey } from '@/lib/localStorage';
import type { ServerInfo } from '@/types';
import { call } from '@/lib/api';

type ConfigContextType = {
  serverInfo: ServerInfo | null;
  getConfig: () => ServerInfo;
  setConfig: (value: ServerInfo | undefined) => void;
  deleteConfig: () => void;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  useEffect(() => {
    const config = getConfig();
    setServerInfo(config);
  }, []);

  const getConfig = () => {
    const config = getLocalKey('currentServer');
    if (config === '') {
      const si: ServerInfo = {
        server: '',
        version: '',
        apiResources: [],
      };
      return si;
    }
    return JSON.parse(config) as ServerInfo;
  };

  const setConfig = async (value: ServerInfo | undefined) => {
    if (value === undefined) {
      throw new Error('cant load server config');
    }
    setServerInfo(value);
    const apiResource = await call('list_apiresources', { server: value.server });
    value.apiResources = apiResource;
    setLocalKey('currentServer', JSON.stringify(value));
  };

  const deleteConfig = () => {
    delLocalKey('currentServer');
    const si: ServerInfo = {
      server: '',
      version: '',
      apiResources: [],
    };
    setServerInfo(si);
  };

  return (
    <ConfigContext.Provider value={{ serverInfo, getConfig, setConfig, deleteConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider');
  return ctx;
};
