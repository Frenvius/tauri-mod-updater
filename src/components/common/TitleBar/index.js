import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

import OptionsMenu from './Menu';
import styles from './styles.module.scss';

const TitleBar = ({ openFolder, uninstall, startGame }) => {
	const isClient = typeof window !== 'undefined';
	const [anchorEl, setAnchorEl] = React.useState(null);

	const { appWindow } = isClient ? window.__TAURI__.window : {};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<div className={styles.container}>
			<button className={`${styles.btn} ${styles.options}`} onClick={handleClick}>
				Options
			</button>
			<OptionsMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} openFolder={openFolder} uninstall={uninstall} startGame={startGame} />
			<div data-tauri-drag-region className={styles.titleBar}></div>
			<button className={`${styles.btn} ${styles.closeButton}`} onClick={() => appWindow.close()}>
				<CloseIcon sx={{ fontSize: 15, color: '#d2d2d2' }} />
			</button>
		</div>
	);
};

export default TitleBar;
