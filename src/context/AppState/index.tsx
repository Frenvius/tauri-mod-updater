import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

import { AppStateContext } from '~/context/AppState/constants';
import { ProgressType, AppStateProviderProps } from '~/context/AppState/types';

const AppStateProvider: React.FC<AppStateProviderProps> = ({ config, children, updateData }) => {
	const [repoUrl, setRepo] = React.useState(config.repoUrl);
	const [playText, setPlayText] = React.useState('Play');
	const [appVersion, setAppVersion] = React.useState('');
	const [gitProgress, setGitProgress] = React.useState(0);
	const [playDisabled, setPlayDisabled] = React.useState(false);
	const [statusText, setStatusText] = React.useState('Ready to play');
	const [needsUpdate, setNeedsUpdate] = React.useState(config.update || false);
	const [isInstalled, setIsInstalled] = React.useState(config.installed || false);
	const [progressType, setProgressType] = React.useState('determinate' as ProgressType);

	const setRepoUrl = async (url: string): Promise<void> => {
		setRepo(url);
		await setConfig('repoUrl', url);
	};

	const setUpdateNeeded = (update: boolean) => {
		setConfig('update', update).then(() => {
			setNeedsUpdate(update);
		});
	};

	const setInstalled = (installed: boolean) => {
		setConfig('installed', installed).then(() => {
			setIsInstalled(installed);
		});
	};

	const setProgress = (value: number) => {
		if (value < 100) {
			setGitProgress(value);
			setStatusText(`Downloading ${value}%`);
		}
	};

	const setConfig = async (key: string, value: string | boolean): Promise<void> => {
		await invoke('set_config', { key, value });
	};

	const listenEvent = (event: string, callback: (event: any) => void, unlisted: UnlistenFn[]) => {
		listen(event, ({ payload }) => callback(payload)).then((unsubscribe) => unlisted.push(unsubscribe));
	};

	React.useEffect(() => {
		const unlisted: UnlistenFn[] = [];

		listenEvent('play_text', setPlayText, unlisted);
		listenEvent('is_installed', setInstalled, unlisted);
		listenEvent('status_text', setStatusText, unlisted);
		listenEvent('git_progress', setGitProgress, unlisted);
		listenEvent('needs_update', setUpdateNeeded, unlisted);
		listenEvent('progress_type', setProgressType, unlisted);
		listenEvent('git_pull_progress', setProgress, unlisted);
		listenEvent('play_disabled', setPlayDisabled, unlisted);
		listenEvent('git_clone_progress', setProgress, unlisted);

		return () => {
			unlisted.forEach((unsubscribe) => unsubscribe());
		};
	}, []);

	React.useEffect(() => {
		getVersion().then((version: string) => {
			setAppVersion(version || '0.0.0');
		});
	}, []);

	return (
		<AppStateContext.Provider
			value={{
				config,
				repoUrl,
				playText,
				setRepoUrl,
				statusText,
				appVersion,
				gitProgress,
				isInstalled,
				needsUpdate,
				playDisabled,
				progressType,
				update: updateData
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
};

export default AppStateProvider;
