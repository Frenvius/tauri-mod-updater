import React from 'react';

import LogProvider from '~/context/LogContext';
import AppStateProvider from '~/context/AppState';
import { AppProvidersProps } from '~/context/types.ts';

const AppProviders: React.FC<AppProvidersProps> = ({ data, update, children }) => {
	return (
		<LogProvider>
			<AppStateProvider config={data} updateData={update}>
				{children}
			</AppStateProvider>
		</LogProvider>
	);
};

export default AppProviders;
