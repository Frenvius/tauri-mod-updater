import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { Scrollbars } from 'react-custom-scrollbars-2';
import React, { useState, useEffect, useContext } from 'react';

import styles from './styles.module.scss';
import { LogContext } from '~/context/LogContext/constants.tsx';

interface IContextMenu {
	mouseX: number;
	mouseY: number;
}

const LogPanel: React.FC = () => {
	const { logs, cleanLogs } = useContext(LogContext);
	// const [scrollRef, setScrollRef] = useState(null);
	const scrollRef = React.useRef<Scrollbars & { view: HTMLDivElement; update: () => void }>(null);
	const [contextMenu, setContextMenu] = useState<IContextMenu | null>(null);

	useEffect(() => {
		scrollRef?.current?.scrollToBottom();
	}, [logs]);

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();

		setContextMenu(
			contextMenu === null
				? {
						mouseX: event.clientX + 2,
						mouseY: event.clientY - 6
				  }
				: null
		);
	};

	const handleClose = (): void => {
		setContextMenu(null);
	};

	const handleClean = (): void => {
		cleanLogs();
		handleClose();
	};

	return (
		<div className={styles.container} onContextMenu={handleContextMenu}>
			<Menu
				open={contextMenu !== null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
			>
				<MenuItem className={styles.menuItem} onClick={handleClean}>
					Clean
				</MenuItem>
			</Menu>
			<Scrollbars ref={scrollRef} style={{ width: '100%', height: '135px' }}>
				{logs.map((message, index) => {
					return <p key={index}>{message}</p>;
				})}
			</Scrollbars>
		</div>
	);
};

export default LogPanel;
