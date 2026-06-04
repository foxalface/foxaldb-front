import { useContext } from 'react';
import { diagramAccessContext } from '@/context/diagram-access-context/diagram-access-context';

export const useDiagramAccess = () => useContext(diagramAccessContext);
