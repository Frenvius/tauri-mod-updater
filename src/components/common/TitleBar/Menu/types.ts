import React, { SetStateAction } from 'react';

export interface MenuOptionsProps {
	anchorEl: null | Element;
	setAnchorEl: React.Dispatch<SetStateAction<HTMLElement | null>>;
}
