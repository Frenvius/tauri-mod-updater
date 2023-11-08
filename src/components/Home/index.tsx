import React from 'react';
import { Grid, Tooltip } from '@mui/material';
import { relaunch } from '@tauri-apps/plugin-process';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './styles.module.scss';
import LogPanel from '~/components/LogPanel';
import { gitService } from '~/services/git.service';
import { fileService } from '~/services/file.service';
import { stateService } from '~/services/state.service';
import { commandService } from '~/services/command.service';
import { LogContext } from '~/context/LogContext/constants';
import { AppStateContext } from '~/context/AppState/constants';
import LinearProgressWithLabel from '~/components/common/LinearProgressWithLabel';

const Home = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { setLog } = React.useContext(LogContext);
	const [state] = React.useState(location.state || {});
	const { valheimPath, setValheimPath } = React.useContext(AppStateContext);
	const { update, repoUrl } = React.useContext(AppStateContext);
	const { gitProgress, appVersion } = React.useContext(AppStateContext);
	const { statusText, playDisabled } = React.useContext(AppStateContext);
	const { isInstalled, needsUpdate } = React.useContext(AppStateContext);
	const { playText, progressType } = React.useContext(AppStateContext);

	const playButton = async () => {
		if (isInstalled) checkForUpdates(false);
		if (needsUpdate) return await updateRepo();

		if (isInstalled && !needsUpdate) {
			await commandService.startGame();
		} else {
			await cloneRepo();
		}
	};

	const cloneRepo = async (executablePath?: string): Promise<void> => {
		stateService.setDownloading();
		const res = await gitService.clone(executablePath);
		await unpackRepo(res as string);
	};

	const updateRepo = async (): Promise<void> => {
		stateService.setUpdating();
		const res = await gitService.pull();
		await unpackRepo(res as string, true);
	};

	const unpackRepo = async (res: string, clean: boolean = false): Promise<void> => {
		if (res === 'done') {
			stateService.setUnpacking();
			clean && (await fileService.uninstall(false, true));
			const result = await fileService.unpack();
			if (!result.stderr) stateService.setInstalled();
		}
	};

	const checkForUpdates = (showMessage = true): void => {
		gitService.checkLastCommit().then((isUpdated) => {
			if (isUpdated) {
				stateService.setReady(showMessage);
			} else {
				stateService.setUpdateAvailable(showMessage);
			}
		});
	};

	const checkValheimProcess = (valheimPath: string): void => {
		if (valheimPath) {
			fileService.checkIfInstalled().then((exists) => {
				if (exists) {
					checkForUpdates();
				} else {
					stateService.setNotInstalled();
				}
			});
		} else {
			commandService.startGame().then(async () => {
				commandService.findValheimProcess().then(async ({ isPathValid, executablePath }) => {
					if (isPathValid) {
						await setValheimPath(executablePath || valheimPath);
						commandService.killValheimProcess().then(async () => {
							setLog('-> Valheim path set!');
							stateService.setNotInstalled();
						});
					}
				});
			});
		}
	};

	React.useEffect(() => {
		if (!needsUpdate) {
			const interval = setInterval(() => {
				if (isInstalled) {
					checkForUpdates(false);
				}
			}, 3000);
			return () => clearInterval(interval);
		}
	}, [needsUpdate, isInstalled]);

	React.useEffect(() => {
		navigate('.', { replace: true });
		if (!repoUrl) {
			navigate('/settings');
		}

		if (state?.from !== 'settings' && !!repoUrl) {
			stateService.setPlayDisabled(true);
			checkValheimProcess(valheimPath);
		}
	}, []);

	const hasUpdate = update?.currentVersion !== update?.version;

	const handleUpdate = async () => {
		await update?.downloadAndInstall();
		await relaunch();
	};

	return (
		<div className={styles.container}>
			<LogPanel />
			<Grid container spacing={0.5}>
				<Grid className={styles.statusText} item xs={12}>
					<div>Status: {statusText}</div>
					<div onClick={handleUpdate} className={styles.updateButton}>
						{hasUpdate ? (
							<Tooltip title="Click to update" placement="top">
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
					<LinearProgressWithLabel variant={progressType} value={gitProgress} />
				</Grid>
				<Grid item xs={3.5}>
					<button className={styles.playButton} onClick={playButton} disabled={playDisabled}>
						{playText}
					</button>
				</Grid>
			</Grid>
		</div>
	);
};

export default Home;
