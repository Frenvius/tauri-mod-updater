import { ReactNode } from 'react';
import { Update } from '@tauri-apps/plugin-updater';

export type ProgressType = 'determinate' | 'indeterminate' | 'buffer' | 'query' | undefined;

export interface AppStateContextProps {
	update: Update | null;
	repoUrl: string;
	playText: string;
	statusText: string;
	appVersion: string;
	valheimPath: string;
	gitProgress: number;
	isInstalled: boolean;
	needsUpdate: boolean;
	playDisabled: boolean;
	progressType: ProgressType;
	setRepoUrl: (url: string) => Promise<void>;
	setValheimPath: (path: string) => Promise<void>;
}

export interface Config {
	installed: boolean;
	update: boolean;
	repoUrl: string;
	valheimPath: string;
}

export interface AppStateProviderProps {
	config: Config;
	updateData: Update | null;
	children: ReactNode;
}
