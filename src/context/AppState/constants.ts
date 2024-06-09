import { createContext } from 'react';

import { Config, AppStateContextProps } from './types';

const initialState: AppStateContextProps = {
	repoUrl: '',
	update: null,
	playText: '',
	appVersion: '',
	statusText: '',
	gitProgress: 0,
	isInstalled: false,
	needsUpdate: false,
	playDisabled: false,
	config: {} as Config,
	progressType: undefined,
	setRepoUrl: async () => {}
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);
