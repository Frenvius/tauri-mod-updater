import React from 'react';

import styles from './styles.module.scss';
import { LogContext } from 'context/LogContext';

const LogPanel = () => {
	const bottomRef = React.useRef(null);
	const { logs } = React.useContext(LogContext);

	React.useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [logs]);

	return (
		<div className={styles.container}>
			<div>
				{logs.map((message, index) => {
					return <p key={index}>{message}</p>;
				})}
				<div ref={bottomRef} />
			</div>
		</div>
	);
};

export default LogPanel;
