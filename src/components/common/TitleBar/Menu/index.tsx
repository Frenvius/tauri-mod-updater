import React from 'react';
import { Menu, MenuItem } from '@mui/material';

import styles from './styles.module.scss';
import { fileService } from '~/services/file.service';
import { commandService } from '~/services/command.service.ts';
import { AppStateContext } from '~/context/AppState/constants.ts';
import { MenuOptionsProps } from '~/components/common/TitleBar/Menu/types.ts';

const MenuOptions: React.FC<MenuOptionsProps> = ({ anchorEl, setAnchorEl }) => {
	const open = Boolean(anchorEl);
	const { isInstalled, valheimPath } = React.useContext(AppStateContext);
	const { playDisabled, gitProgress } = React.useContext(AppStateContext);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleOpenFolder = async () => {
		await commandService.openValheimFolder();
		handleClose();
	};

	const handleUninstall = async () => {
		await fileService.uninstall();
		handleClose();
	};

	const handleOpenGame = () => {
		commandService.startGame();
		handleClose();
	};

	const isDownloading = gitProgress > 0 && gitProgress < 100;
	const startGameDisabled = isInstalled ? playDisabled || isDownloading : isDownloading;

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
			<MenuItem className={styles.menuItem} onClick={handleOpenGame} disabled={startGameDisabled}>
				Start Game
			</MenuItem>
			<MenuItem className={styles.menuItem} onClick={handleUninstall} disabled={!isInstalled}>
				Uninstall Mods
			</MenuItem>
			<MenuItem className={styles.menuItem} onClick={handleOpenFolder} disabled={!valheimPath}>
				Open Valheim Folder
			</MenuItem>
		</Menu>
	);
};

export default MenuOptions;
