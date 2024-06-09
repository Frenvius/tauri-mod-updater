import { createContext } from 'react';

import { AppStateContextProps } from './types';

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
	progressType: undefined,
	setRepoUrl: async () => {}
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);
