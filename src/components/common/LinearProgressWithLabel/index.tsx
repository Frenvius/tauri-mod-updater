import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, LinearProgressProps } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { ProgressType } from '~/context/AppState/types.ts';

const BorderLinearProgress = styled(LinearProgress)(() => ({
	height: 30,
	border: '1px solid #646464',
	[`&.${linearProgressClasses.colorPrimary}`]: {
		backgroundColor: '#262626'
	},
	[`& .${linearProgressClasses.bar}`]: {
		border: '1px solid #646464',
		backgroundColor: '#308fe8'
	}
}));

interface Props extends LinearProgressProps {
	variant?: ProgressType;
}

const LinearProgressWithLabel: React.FC<Props> = (props: Props) => {
	return (
		<Box sx={{ width: '100%' }}>
			<BorderLinearProgress {...props} />
		</Box>
	);
};

export default LinearProgressWithLabel;
