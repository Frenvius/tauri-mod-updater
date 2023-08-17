import React from "react";
import { Grid } from "@mui/material";

import styles from "./style.module.scss";
import LogPanel from "components/LogPanel";
import { LogContext } from "context/LogContext";
import TitleBar from "components/common/TitleBar";
import LinearProgressWithLabel from "components/common/LinearProgressWithLabel";

const Home = () => {
	const isClient = typeof window !== 'undefined';
	const { setLog } = React.useContext(LogContext);
	const [playText, setPlayText] = React.useState('Play');
	const [gitProgress, setGitProgress] = React.useState(0);
	const [playDisabled, setPlayDisabled] = React.useState(false);
	const [isInstalled, setIsInstalled] = React.useState(false);
	const [needsUpdate, setNeedsUpdate] = React.useState(false);
	const [progressType, setProgressType] = React.useState('determinate');
	const [statusText, setStatusText] = React.useState('Checking for updates...');

	const { invoke } = isClient ? window.__TAURI__ : {};
	const { Command } = isClient ? window.__TAURI__.shell : {};
	const { appWindow } = isClient ? window.__TAURI__.window : {};
	const { exists, readTextFile, removeDir, removeFile, writeTextFile } = isClient ? window?.__TAURI__.fs : {};

	const configFile = async () => {
		if (isClient) {
			const user = await invoke('sys_user_name');
			return `C:\\Users\\${user}\\mod_updater_data.txt`;
		}
	};

	const getConfigFile = async () => {
		const path = await configFile();
		const fileExist = await exists(path);
		if (fileExist) {
			return await readTextFile(path);
		} else {
			return await writeTextFile(path, '{}');
		}
	};

	const getConfig = async (key) => {
		const config = await getConfigFile();
		return JSON.parse(config)[key];
	};

	const setConfig = async (key, value) => {
		const path = await configFile();
		const fileContent = await getConfigFile();
		const config = JSON.parse(fileContent);
		config[key] = value;
		await writeTextFile(path, JSON.stringify(config));
	};

	const setInstalled = () => {
		setProgressType('indeterminate');
		setConfig('update', false).then(async () => {
			await setConfig('installed', true);
			setPlayText('Play');
			setPlayDisabled(false);
			setProgressType('determinate');
			setGitProgress(100);
			setStatusText('Done!');
		});
	};

	getConfig('installed').then((res) => {
		setIsInstalled(res);
	});
	getConfig('update').then((res) => {
		setNeedsUpdate(res);
	});

	React.useEffect(() => {
		setPlayDisabled(true);
		appWindow.listen('git_clone_progress', ({ payload }) => progress(payload)).then((unlisten) => unlisten);
		appWindow.listen('git_pull_progress', ({ payload }) => progress(payload)).then((unlisten) => unlisten);
		getConfig('valheim-path').then(async (valheimPath) => {
			if (valheimPath) {
				exists(`${valheimPath}\\updater`).then((exists) => {
					if (exists) {
						checkForUpdates();
						setStatusText('Ready to play');
						setLog('-> Ready to play!');
						setPlayDisabled(false);
						setPlayText('Play');
					} else {
						setLog('-> You need to install the mods first');
						setConfig('installed', false);
						setConfig('update', false);
						setPlayDisabled(false);
						setPlayText('Install');
					}
				});
			} else {
				checkValheimProcess();
			}
		});
	}, []);

	const pathChecker = (path) => {
		return path.match(
			/^(?!.*[\\\/]\s+)(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"\|\?\*\n])+(?:\/\/|\/|\\\\|\\)?)+$/gm
		);
	};

	const checkValheimProcess = () => {
		const interval = setInterval(() => {
			if (isInstalled) {
				setLog('-> Ready to play!');
				setPlayDisabled(false);
			} else {
				new Command('wmic', ['process', 'where', "name='Valheim.exe'", 'get', 'ExecutablePath'], {
					encoding: 'utf8'
				})
					.execute()
					.then((res) => {
						const valheimDir = res.stdout.replace('ExecutablePath', '').trim();
						const valheimPath = valheimDir.replace('\\valheim.exe', '');

						if (pathChecker(valheimDir)) {
							setConfig('valheim-path', valheimPath).then(() => {
								setConfig('installed', true).then(() => {
									new Command('taskkill', ['/f', '/im', 'Valheim.exe'], {
										encoding: 'utf8'
									})
										.execute()
										.then((res) => {
											setLog('-> Valheim is already running!');
											setLog('-> Valheim path set!');
											clearInterval(interval);
											cloneRepo();
										});
								});
							});
						} else {
							setLog('-> Please launch Valheim to begin install!');
							clearInterval(interval);
							checkValheimProcess();
						}
					});
			}
		}, 2000);
	};

	const removePluginsFolder = async () => {
		const path = await getConfig('valheim-path');
		return await removeDir(`${path}\\BepInEx\\plugins`, { recursive: true });
	}

	const unpackRepo = async () => {
		setLog('-> Unpacking mods...');
		setStatusText('Unpacking mods...');
		const path = await getConfig('valheim-path');
		return new Command('robocopy', [`${path}\\updater`, `${path}`, '/E', '/XD', '.git'], {
			encoding: 'utf8'
		}).execute();
	};

	const progress = (value) => {
		if (value < 100) {
			setGitProgress(parseInt(value));
			setStatusText(`Downloading ${value}%`);
		}
	};

	const cloneRepo = () => {
		setLog('-> Downloading mods...');
		setPlayDisabled(true);
		setPlayText('Installing');
		getConfig('valheim-path').then((path) => {
			const url = 'https://github.com/Frenvius/disneyland-mods.git';
			invoke('git_clone', { url, path: `${path}\\updater`, window: appWindow })
				.then((res) => {
					if (res === 'done') {
						setConfig('installed', true).then(() => {
							unpackRepo().then((result) => {
								if (!result.stderr) {
									setInstalled();
								}
							});
						});
					}
				})
				.catch((err) => {
					if (err.includes('already exists') || err.includes('exists and is not an empty')) {
						console.log('already exists');
						updateRepo();
					}
				});
		});
	};

	const openValheimFolder = () => {
		getConfig('valheim-path').then((path) => {
			new Command('explorer', [`${path}`]).execute();
		});
	};

	const updateRepo = () => {
		setLog('-> Updating mods...');
		setPlayText('Updating');
		setPlayDisabled(true);
		getConfig('valheim-path').then((path) => {
			invoke('git_pull', { path: `${path}\\updater`, window: appWindow })
				.then((res) => {
					if (res === 'done') {
						setConfig('installed', true).then(() => {
							removePluginsFolder().then(() => {
								unpackRepo().then((result) => {
									if (!result.stderr) {
										setInstalled();
									}
								});
							});
						});
					}
				})
				.catch((err) => {
					if (err.includes('already exists') || err.includes('exists and is not an empty')) {
						console.log('already exists');
						updateRepo();
					}
				});
		});
	};

	const getCurrentCommit = async () => {
		const path = await getConfig('valheim-path');
		return await invoke('get_current_hash', { path: `${path}\\updater` });
	};

	const checkForUpdates = () => {
		checkLastCommit().then((isUpdated) => {
			if (isUpdated) {
				setLog('-> Running latest mods');
			} else {
				setLog('-> New updates found!');
				setPlayText('Update');
				setConfig('update', true).then(() => {
					setNeedsUpdate(true);
				});
			}
		});
	};

	const checkLastCommit = async () => {
		const path = await getConfig('valheim-path');
		const latestCommit = await invoke('get_latest_hash', { path: `${path}\\updater` });
		const hash = await getCurrentCommit();
		return latestCommit === hash;
	};

	const startGame = () => {
		if (isClient) {
			invoke('run_game_windows', { exec: '/C start steam://rungameid/892970' }).then(() => {
				setLog('-> Starting Valheim...');
			});
		}
	};

	const removeIfExist = async (path, type) => {
		const exist = await exists(path);
		const name = path.split('\\').pop();
		if (exist) {
			if (type === 'file') {
				await removeFile(path);
				setLog(`-> Removed file ${name}`);
			} else {
				await removeDir(path, { recursive: true });
				setLog(`-> Removed folder ${name}`);
			}
		} else {
			setLog(`-> ${name} does not exist`);
		}
	};

	const cleanMods = () => {
		setLog('-> Removing old files');
		setPlayDisabled(true);
		setStatusText('Uninstalling');
		getConfig('valheim-path').then(async (path) => {
			await removeIfExist(`${path}\\updater`, 'dir');
			await removeIfExist(`${path}\\BepInEx`, 'dir');
			await removeIfExist(`${path}\\doorstop_libs`, 'dir');
			await removeIfExist(`${path}\\doorstop_config.ini`, 'file');
			await removeIfExist(`${path}\\winhttp.dll`, 'file');
			await removeIfExist(`${path}\\doorstop_config.ini`, 'file');
		});
		setConfig('installed', false).then(() => {
			setGitProgress(0);
			setStatusText('Uninstalled!');
			setLog('-> Old files removed!');
			setPlayDisabled(false);
			setPlayText('Install');
		});
	};

	const playButton = () => {
		if (needsUpdate) {
			updateRepo();
		}

		if (isInstalled) {
			checkLastCommit().then((result) => {
				if (!result) {
					checkForUpdates();
				} else {
					startGame();
				}
			});
		} else {
			cloneRepo();
		}
	};

	return (
		<div>
			<TitleBar openFolder={openValheimFolder} uninstall={cleanMods} startGame={startGame} />
			<div className={styles.container}>
				<LogPanel />
				<Grid container spacing={0.5}>
					<Grid className={styles.statusText} item xs={12}>
						Status: {statusText}
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
		</div>
	);
};

export default Home;
