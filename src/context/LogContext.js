import React from 'react';
export const LogContext = React.createContext({});

const LogProvider = ({ children }) => {
	const [logs, setLogs] = React.useState(['----- Valheim Launcher -----']);

	const setLog = (str) => {
		setLogs((prev) => [...prev, str]);
	};

	return (
		<LogContext.Provider
			value={{
				logs,
				setLog
			}}
		>
			{children}
		</LogContext.Provider>
	);
};

export default LogProvider;
