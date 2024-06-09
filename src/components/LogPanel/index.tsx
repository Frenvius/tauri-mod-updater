import { Menu } from '@mui/material';
import React, { useContext } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { Scrollbars } from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import { LogContext } from '~/context/LogContext/constants';

interface IContextMenu {
	mouseX: number;
	mouseY: number;
}

const LogPanel: React.FC = () => {
	const { logs, cleanLogs } = useContext(LogContext);
	const scrollRef = React.useRef<Scrollbars & { update: () => void; view: HTMLDivElement }>(null);
	const [contextMenu, setContextMenu] = React.useState<null | IContextMenu>(null);

	React.useEffect(() => {
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
				onClose={handleClose}
				open={contextMenu !== null}
				anchorReference="anchorPosition"
				anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
			>
				<MenuItem onClick={handleClean} className={styles.menuItem}>
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
