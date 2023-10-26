import type { LogContextType } from '~/context/LogContext/types.ts';

import { createContext } from 'react';

export const LogContext = createContext<LogContextType>({
	logs: [],
	setLog: () => {},
	cleanLogs: () => {}
});
