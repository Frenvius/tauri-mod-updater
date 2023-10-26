import React from 'react';
import { Grid, Tooltip } from '@mui/material';
import { getCurrent } from '@tauri-apps/api/window';
import { relaunch } from '@tauri-apps/plugin-process';

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
	const { setLog } = React.useContext(LogContext);
	const { update } = React.useContext(AppStateContext);
	const { valheimPath, setValheimPath } = React.useContext(AppStateContext);
	const { gitProgress, appVersion } = React.useContext(AppStateContext);
	const { statusText, playDisabled } = React.useContext(AppStateContext);
	const { isInstalled, needsUpdate } = React.useContext(AppStateContext);
	const { playText, progressType } = React.useContext(AppStateContext);

	const playButton = async () => {
		if (isInstalled) checkForUpdates(false);
		if (needsUpdate) await updateRepo();

		if (isInstalled && !needsUpdate) {
			commandService.startGame();
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
			clean && (await fileService.uninstall(false));
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

	const checkModUpdate = () => {
		const interval = setInterval(() => {
			if (isInstalled) {
				checkForUpdates(false);
				clearInterval(interval);
			}
		}, 30000);
	};

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	const checkValheimProcess = (valheimPath: string, sendMessage = true): void => {
		if (valheimPath) {
			fileService.checkIfInstalled().then((exists) => {
				if (!exists) {
					stateService.setNotInstalled();
				} else {
					checkForUpdates();
				}
			});
		} else {
			commandService.findValheimProcess().then(async ({ isPathValid, executablePath }) => {
				if (isPathValid) {
					setValheimPath(executablePath || valheimPath);
					commandService.killValheimProcess().then(async () => {
						setLog('-> Valheim is already running!');
						setLog('-> Valheim path set!');
						await cloneRepo(executablePath);
					});
				} else {
					stateService.setOpenValheim(sendMessage);
					await sleep(2000);
					checkValheimProcess(valheimPath);
				}
			});
		}
	};

	const progress = (value: number) => {
		if (value < 100) {
			stateService.setGitProgress(value);
			stateService.setStatusText(`Downloading ${value}%`);
		}
	};

	React.useEffect(() => {
		stateService.setPlayDisabled(true);
		getCurrent()
			.listen('git_clone_progress', ({ payload }) => progress(payload as number))
			.then((unlisten) => unlisten);
		getCurrent()
			.listen('git_pull_progress', ({ payload }) => progress(payload as number))
			.then((unlisten) => unlisten);

		checkModUpdate();
		checkValheimProcess(valheimPath, false);
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
