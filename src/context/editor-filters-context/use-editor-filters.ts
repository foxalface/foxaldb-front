import { useContext } from 'react';
import { editorFiltersContext } from './editor-filters-context';

export const useEditorFilters = () => useContext(editorFiltersContext);
