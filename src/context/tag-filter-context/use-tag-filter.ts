import { useContext } from 'react';
import { tagFilterContext } from './tag-filter-context';

export const useTagFilter = () => useContext(tagFilterContext);
