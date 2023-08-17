import * as React from 'react';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';

import styles from './styles.module.scss';

export default function OptionsMenu({ anchorEl, setAnchorEl, openFolder, uninstall, startGame }) {
	const open = Boolean(anchorEl);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleOpenFolder = () => {
		openFolder();
		handleClose();
	};

	const handleUninstall = () => {
		uninstall();
		handleClose();
	};

	const handleOpenGame = () => {
		startGame();
		handleClose();
	};

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={handleClose}
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'left'
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left'
			}}
		>
			<MenuItem className={styles.menuItem} onClick={handleUninstall}>
				Force Update
			</MenuItem>
			<MenuItem className={styles.menuItem} onClick={handleOpenFolder}>
				Valheim Folder
			</MenuItem>
			<MenuItem className={styles.menuItem} onClick={handleOpenGame}>
				Start Game
			</MenuItem>
		</Menu>
	);
}
