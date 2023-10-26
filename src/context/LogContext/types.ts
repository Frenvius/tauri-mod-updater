import { ReactNode } from 'react';

export interface LogProviderProps {
	children: ReactNode;
}

export interface LogContextType {
	logs: string[];
	setLog: (str: string) => void;
	cleanLogs: () => void;
}
