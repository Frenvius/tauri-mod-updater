import React, { useState } from 'react';
import { getCurrent } from '@tauri-apps/api/window';

import { LogContext } from './constants';
import { LogProviderProps } from './types';

const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
	const [logs, setLogs] = useState<string[]>(['----- Valheim Launcher -----']);

	const setLog = (str: string) => {
		setLogs((prev) => [...prev, str]);
	};

	const cleanLogs = () => {
		setLogs(['----- Valheim Launcher -----']);
	};

	const listen = (event: string, callback: (event: any) => void) => {
		getCurrent().listen(event, callback).then();
	};

	React.useEffect(() => {
		listen('set_log', ({ payload }) => {
			setLog(payload as string);
		});
	}, []);

	return (
		<LogContext.Provider
			value={{
				logs,
				setLog,
				cleanLogs
			}}
		>
			{children}
		</LogContext.Provider>
	);
};

export default LogProvider;
