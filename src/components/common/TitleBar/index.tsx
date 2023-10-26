import React, { MouseEvent } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { getCurrent } from '@tauri-apps/api/window';

import MenuOptions from './Menu';
import styles from './styles.module.scss';

const TitleBar: React.FC = () => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<div className={styles.container}>
			<button className={`${styles.btn} ${styles.options}`} onClick={handleClick}>
				Options
			</button>
			<MenuOptions anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
			<div data-tauri-drag-region className={styles.titleBar}></div>
			<button className={`${styles.btn} ${styles.closeButton}`} onClick={() => getCurrent().close()}>
				<CloseIcon sx={{ fontSize: 15, color: '#d2d2d2' }} />
			</button>
		</div>
	);
};

export default TitleBar;
