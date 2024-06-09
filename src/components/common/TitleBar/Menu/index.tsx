import React from 'react';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';

import styles from './styles.module.scss';
import { MenuOptionsProps } from './types';
import { fileService } from '~/services/file.service';
import { commandService } from '~/services/command.service';
import { AppStateContext } from '~/context/AppState/constants';

const MenuOptions: React.FC<MenuOptionsProps> = ({ anchorEl, setAnchorEl }) => {
	const open = Boolean(anchorEl);
	const { isInstalled } = React.useContext(AppStateContext);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleOpenFolder = async () => {
		await commandService.openConfigFolder();
		handleClose();
	};

	const handleUninstall = async () => {
		await fileService.uninstall();
		handleClose();
	};

	return (
		<Menu
			open={open}
			anchorEl={anchorEl}
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
			<MenuItem disabled={!isInstalled} onClick={handleUninstall} className={styles.menuItem}>
				Uninstall mods
			</MenuItem>
			<MenuItem onClick={handleOpenFolder} className={styles.menuItem}>
				Open config folder
			</MenuItem>
		</Menu>
	);
};

export default MenuOptions;
