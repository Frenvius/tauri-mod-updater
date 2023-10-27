import React from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrent } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/primitives';

import { AppStateContext } from '~/context/AppState/constants';
import { ProgressType, AppStateProviderProps } from '~/context/AppState/types';

const AppStateProvider: React.FC<AppStateProviderProps> = ({ config, updateData, children }) => {
	const [playText, setPlayText] = React.useState('Play');
	const [appVersion, setAppVersion] = React.useState('');
	const [gitProgress, setGitProgress] = React.useState(0);
	const [valheimPath, setPath] = React.useState(config.valheimPath);
	const [playDisabled, setPlayDisabled] = React.useState(false);
	const [statusText, setStatusText] = React.useState('Checking for updates...');
	const [needsUpdate, setNeedsUpdate] = React.useState(config.update || false);
	const [isInstalled, setIsInstalled] = React.useState(config.installed || false);
	const [progressType, setProgressType] = React.useState('determinate' as ProgressType);

	const setValheimPath = (path: string): void => {
		setPath(path);
		setConfig('valheimPath', path);
	};

	const setConfig = (key: string, value: string | boolean): void => {
		invoke('set_config', { key, value }).then();
	};
	const listen = (event: string, callback: (event: any) => void) => {
		getCurrent().listen(event, callback).then();
	};

	React.useEffect(() => {
		listen('play_locked', ({ payload }) => {
			setPlayDisabled(payload as boolean);
		});
		listen('play_text', ({ payload }) => {
			setPlayText(payload as string);
		});
		listen('git_progress', ({ payload }) => {
			setGitProgress(+payload as number);
		});
		listen('progress_type', ({ payload }) => {
			setProgressType(payload as ProgressType);
		});
		listen('status_text', ({ payload }) => {
			setStatusText(payload as string);
		});
		listen('needs_update', ({ payload }) => {
			setNeedsUpdate(payload as boolean);
			setConfig('update', payload as boolean);
		});
		listen('is_installed', ({ payload }) => {
			setIsInstalled(payload as boolean);
			setConfig('installed', payload as boolean);
		});
	}, []);

	React.useEffect(() => {
		getVersion().then((version: string) => {
			setAppVersion(version || '0.0.0');
		});
	}, []);

	return (
		<AppStateContext.Provider
			value={{
				update: updateData,
				playText,
				statusText,
				appVersion,
				gitProgress,
				isInstalled,
				needsUpdate,
				valheimPath,
				playDisabled,
				progressType,
				setValheimPath
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
};

export default AppStateProvider;
