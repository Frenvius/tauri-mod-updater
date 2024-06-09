import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Button, Tooltip } from '@mui/material';
import { relaunch } from '@tauri-apps/plugin-process';

import styles from './styles.module.scss';
import LogPanel from '~/components/LogPanel';
import { gitService } from '~/services/git.service';
import { stateService } from '~/services/state.service';
import { commandService } from '~/services/command.service';
import { AppStateContext } from '~/context/AppState/constants';
import LinearProgressWithLabel from '~/components/common/LinearProgressWithLabel';

const Home = () => {
	const navigate = useNavigate();
	const { update, repoUrl } = React.useContext(AppStateContext);
	const { appVersion, gitProgress } = React.useContext(AppStateContext);
	const { statusText, playDisabled } = React.useContext(AppStateContext);
	const { isInstalled, needsUpdate } = React.useContext(AppStateContext);
	const { playText, progressType } = React.useContext(AppStateContext);

	const playButton = async () => {
		if (isInstalled) await checkForUpdates(false);
		if (needsUpdate) return await updateRepo();

		if (isInstalled && !needsUpdate) {
			await commandService.startGame();
		} else {
			await cloneRepo();
		}
	};

	const cloneRepo = async (): Promise<void> => {
		await stateService.setDownloading();
		await gitService.clone();
		await stateService.setInstalled();
	};

	const updateRepo = async (): Promise<void> => {
		await stateService.setUpdating();
		await gitService.pull();
		await stateService.setInstalled();
	};

	const checkForUpdates = async (showMessage = true): Promise<void> => {
		const isUpdated = await gitService.checkLastCommit();

		if (isUpdated === null) {
			await stateService.setNotInstalled();
			return;
		}
		if (isUpdated) {
			await stateService.setReady(showMessage);
		} else {
			await stateService.setUpdateAvailable(showMessage);
		}
	};

	React.useEffect(() => {
		if (!needsUpdate) {
			const interval = setInterval(() => {
				if (isInstalled) {
					checkForUpdates(false);
				}
			}, 5000);
			return () => clearInterval(interval);
		}
	}, [needsUpdate, isInstalled]);

	const hasUpdate = update?.currentVersion !== update?.version;

	const handleUpdate = async () => {
		await update?.downloadAndInstall();
		await relaunch();
	};

	React.useEffect(() => {
		if (!repoUrl) navigate('/settings', { replace: true });
		if (repoUrl) checkForUpdates();
	}, []);

	return (
		<div className={styles.container}>
			<LogPanel />
			<Grid container spacing={0.5}>
				<Grid item xs={12} className={styles.statusText}>
					<div>Status: {statusText}</div>
					<div onClick={handleUpdate} className={styles.updateButton}>
						{hasUpdate ? (
							<Tooltip placement="top" title="Click to update">
								<div className={styles.link}>
									{appVersion} &#8594; {update?.version}
								</div>
							</Tooltip>
						) : (
							appVersion
						)}
					</div>
				</Grid>
				<Grid item xs={8.5}>
					<LinearProgressWithLabel value={gitProgress} variant={progressType} />
				</Grid>
				<Grid item xs={3.5}>
					<Button onClick={playButton} disabled={playDisabled} className={styles.playButton}>
						{playText}
					</Button>
				</Grid>
			</Grid>
		</div>
	);
};

export default Home;
