import type { LogContextType } from './types';

import { createContext } from 'react';

export const LogContext = createContext<LogContextType>({
	logs: [],
	setLog: () => {},
	cleanLogs: () => {}
});
