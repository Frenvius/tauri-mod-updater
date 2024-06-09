import React from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { Grid, Alert, TextField, Typography } from '@mui/material';

import styles from './styles.module.scss';
import { AppStateContext } from '~/context/AppState/constants';

interface SettingsProps {
	refresh?: boolean;
}

const Settings = ({ refresh }: SettingsProps) => {
	const navigate = useNavigate();
	const { repoUrl, setRepoUrl } = React.useContext(AppStateContext);
	const [repo, setRepo] = React.useState<string>(repoUrl || '');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);

	const handleRepoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRepo(event.target.value);
	};

	const saveSettings = async () => {
		setIsLoading(true);
		await setRepoUrl(repo);
		navigate('/');
		refresh && navigate(0);
	};

	return (
		<div className={styles.container}>
			<Grid container spacing={1.4} sx={{ height: '100%' }}>
				<Grid item xs={12} display="flex" alignItems="center" className={styles.header} justifyContent="space-between">
					<Typography className={styles.title}>Settings:</Typography>
					{!repoUrl && (
						<Alert severity="warning" className={styles.warning}>
							You need to set the repository url first!
						</Alert>
					)}
				</Grid>
				<Grid item xs={12}>
					<TextField
						fullWidth
						size="small"
						value={repo}
						variant="outlined"
						disabled={isLoading}
						label="Repository Url"
						onChange={handleRepoUrlChange}
					/>
				</Grid>
				<Grid item xs={12} display="flex" alignItems="flex-end" justifyContent="flex-end">
					<LoadingButton loading={isLoading} className={styles.saveButton} onClick={async () => await saveSettings()}>
						Save
					</LoadingButton>
				</Grid>
			</Grid>
		</div>
	);
};

export default Settings;
