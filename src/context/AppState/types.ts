import { ReactNode } from 'react';
import { Update } from '@tauri-apps/plugin-updater';

export type ProgressType = 'query' | 'buffer' | undefined | 'determinate' | 'indeterminate';

export interface AppStateContextProps {
	config: Config;
	repoUrl: string;
	playText: string;
	statusText: string;
	appVersion: string;
	gitProgress: number;
	isInstalled: boolean;
	needsUpdate: boolean;
	update: null | Update;
	playDisabled: boolean;
	progressType: ProgressType;
	setRepoUrl: (url: string) => Promise<void>;
}

export interface Config {
	update: boolean;
	repoUrl: string;
	installed: boolean;
}

export interface AppStateProviderProps {
	config: Config;
	children: ReactNode;
	updateData: null | Update;
}
