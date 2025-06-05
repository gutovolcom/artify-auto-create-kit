
import React from 'react';
import { LayoutEditorProps } from './layout-editor/types';
import { LayoutEditorContainer } from './layout-editor/LayoutEditorContainer';

export const LayoutEditor: React.FC<LayoutEditorProps> = (props) => {
  return <LayoutEditorContainer {...props} />;
};
