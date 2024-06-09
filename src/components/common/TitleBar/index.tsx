import React, { MouseEvent } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { getCurrent } from '@tauri-apps/api/window';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';

import MenuOptions from './Menu';
import styles from './styles.module.scss';

const TitleBar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOpenSettings = () => {
		navigate('/settings');
	};

	const handleBack = () => {
		navigate('/', { state: { from: 'settings' } });
	};

	const isSettingWindowOpen = location.pathname === '/settings';

	return (
		<div className={styles.container}>
			{!isSettingWindowOpen ? (
				<button onClick={handleClick} className={`${styles.btn} ${styles.options}`}>
					Options
				</button>
			) : (
				<button onClick={handleBack} className={`${styles.btn} ${styles.backButton}`}>
					<ArrowBackIcon sx={{ fontSize: 15, color: '#d2d2d2' }} />
				</button>
			)}
			<MenuOptions anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
			<div data-tauri-drag-region className={styles.titleBar}></div>
			{!isSettingWindowOpen && (
				<button onClick={handleOpenSettings} className={`${styles.btn} ${styles.settingsButton}`}>
					<SettingsIcon sx={{ fontSize: 15, color: '#d2d2d2' }} />
				</button>
			)}
			{!isSettingWindowOpen && (
				<button onClick={() => getCurrent().close()} className={`${styles.btn} ${styles.closeButton}`}>
					<CloseIcon sx={{ fontSize: 15, color: '#d2d2d2' }} />
				</button>
			)}
		</div>
	);
};

export default TitleBar;
