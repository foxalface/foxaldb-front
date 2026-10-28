export type ProtectedAuthAction =
    | 'share'
    | 'framework-export'
    | 'project-import'
    | 'merge'
    | 'create-online-diagram';

export type AuthIntent =
    | { type: 'none' }
    | { type: 'open-online-tab' }
    | { type: 'open-online-diagram'; diagramId: string }
    | {
          type: 'put-online';
          localId: string;
          mode: 'copy' | 'move';
      }
    | {
          type: 'protected-action';
          action: ProtectedAuthAction;
      };

export const noneAuthIntent = (): AuthIntent => ({ type: 'none' });

export const isNoneAuthIntent = (
    intent: AuthIntent
): intent is { type: 'none' } => intent.type === 'none';
