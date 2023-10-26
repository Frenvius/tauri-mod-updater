import { createContext } from 'react';

import { AppStateContextProps } from '~/context/AppState/types.ts';

const initialState: AppStateContextProps = {
	update: null,
	playText: '',
	appVersion: '',
	statusText: '',
	gitProgress: 0,
	valheimPath: '',
	isInstalled: false,
	needsUpdate: false,
	playDisabled: false,
	progressType: undefined,
	setValheimPath: () => {}
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);
