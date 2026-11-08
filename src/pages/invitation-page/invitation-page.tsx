import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useEmailVerificationWatch } from '@/hooks/use-email-verification-watch';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api/client';
import {
    acceptInvitation,
    inspectInvitation,
    invitationErrorCode,
    type InvitationInspection,
} from '@/lib/api/diagram-invitation';
import {
    LoginFormPanel,
    RegisterFormPanel,
} from '@/pages/auth/auth-form-panels';
import { useTranslation } from 'react-i18next';

type AuthPanel = 'details' | 'login' | 'register';
type TerminalStatus = 'expired' | 'revoked' | 'accepted' | 'invalid';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const InvitationPageContent: React.FC = () => {
    const { t } = useTranslation();
    const { token = '' } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isEmailVerified, isLoading, logout } =
        useAuth();
    const verification = useEmailVerificationWatch();
    const [inspection, setInspection] = useState<InvitationInspection | null>(
        null
    );
    const [terminalStatus, setTerminalStatus] = useState<TerminalStatus | null>(
        null
    );
    const [inspectError, setInspectError] = useState(false);
    const [isInspecting, setIsInspecting] = useState(true);
    const [panel, setPanel] = useState<AuthPanel>('details');
    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState(false);

    const loadInvitation = useCallback(async () => {
        if (token === '') {
            setTerminalStatus('invalid');
            setIsInspecting(false);
            return;
        }

        setIsInspecting(true);
        setInspectError(false);

        try {
            const next = await inspectInvitation(token);
            setInspection(next);
            setTerminalStatus(next.status === 'valid' ? null : next.status);
        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 404) {
                setTerminalStatus('invalid');
            } else {
                setInspectError(true);
            }
        } finally {
            setIsInspecting(false);
        }
    }, [token]);

    useEffect(() => {
        void loadInvitation();
    }, [loadInvitation]);

    const handleAccept = useCallback(async () => {
        setIsAccepting(true);
        setAcceptError(false);

        try {
            const result = await acceptInvitation(token);
            navigate(`/diagrams/${result.diagramId}`);
        } catch (error: unknown) {
            const code = invitationErrorCode(error);
            if (
                code === 'expired' ||
                code === 'revoked' ||
                code === 'accepted'
            ) {
                setTerminalStatus(code);
                return;
            }

            if (code === 'email_mismatch') {
                setAcceptError(true);
                return;
            }

            if (error instanceof ApiError && error.status === 403) {
                return;
            }

            if (error instanceof ApiError && error.status === 404) {
                setTerminalStatus('invalid');
                return;
            }

            setAcceptError(true);
        } finally {
            setIsAccepting(false);
        }
    }, [navigate, token]);

    const roleLabel = (role: 'editor' | 'viewer'): string =>
        t(`diagram_role.${role}`);

    const shell = (children: React.ReactNode): React.ReactElement => (
        <>
            <Helmet>
                <title>{t('diagram_invitation.title')}</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                    <p className="text-sm font-semibold">FoxalDB</p>
                    {children}
                </div>
            </section>
        </>
    );

    if (isLoading || isInspecting) {
        return shell(
            <p className="text-sm text-muted-foreground">
                {t('diagram_invitation.loading')}
            </p>
        );
    }

    if (inspectError) {
        return shell(
            <>
                <p className="text-sm">
                    {t('diagram_invitation.generic_error')}
                </p>
                <Button onClick={() => void loadInvitation()}>
                    {t('diagram_invitation.retry')}
                </Button>
            </>
        );
    }

    if (terminalStatus === 'invalid') {
        return shell(<p>{t('diagram_invitation.invalid')}</p>);
    }

    if (terminalStatus === 'expired') {
        return shell(<p>{t('diagram_invitation.expired')}</p>);
    }

    if (terminalStatus === 'revoked') {
        return shell(<p>{t('diagram_invitation.revoked')}</p>);
    }

    if (terminalStatus === 'accepted' || inspection?.status === 'accepted') {
        if (!isAuthenticated && panel === 'login') {
            return shell(
                <>
                    <LoginFormPanel
                        onForgotPassword={() => navigate('/forgot-password')}
                        onSuccess={() => setPanel('details')}
                        onSwitchToRegister={() => setPanel('register')}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => setPanel('details')}
                    >
                        {t('diagram_invitation.back')}
                    </Button>
                </>
            );
        }

        return shell(
            <>
                <p>{t('diagram_invitation.accepted')}</p>
                {isAuthenticated ? (
                    <Button
                        onClick={() => void handleAccept()}
                        disabled={isAccepting}
                    >
                        {isAccepting
                            ? t('diagram_invitation.accepting')
                            : t('diagram_invitation.open_diagram')}
                    </Button>
                ) : (
                    <Button onClick={() => setPanel('login')}>
                        {t('diagram_invitation.sign_in')}
                    </Button>
                )}
                {acceptError ? (
                    <p className="text-sm text-destructive">
                        {t('diagram_invitation.generic_error')}
                    </p>
                ) : null}
            </>
        );
    }

    if (inspection?.status !== 'valid') {
        return shell(<p>{t('diagram_invitation.invalid')}</p>);
    }

    const invitedEmail = inspection.email;
    const emailsMatch =
        user !== null &&
        normalizeEmail(user.email) === normalizeEmail(invitedEmail);

    if (!isAuthenticated) {
        if (panel === 'register') {
            return shell(
                <>
                    <RegisterFormPanel
                        invitationToken={token}
                        lockedEmail={invitedEmail}
                        onSuccess={() => setPanel('details')}
                        onSwitchToLogin={() => setPanel('login')}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => setPanel('details')}
                    >
                        {t('diagram_invitation.back')}
                    </Button>
                </>
            );
        }

        if (panel === 'login') {
            return shell(
                <>
                    <LoginFormPanel
                        onForgotPassword={() => navigate('/forgot-password')}
                        onSuccess={() => setPanel('details')}
                        onSwitchToRegister={() => setPanel('register')}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => setPanel('details')}
                    >
                        {t('diagram_invitation.back')}
                    </Button>
                </>
            );
        }

        return shell(
            <>
                <h1 className="text-2xl font-semibold">
                    {t('diagram_invitation.title')}
                </h1>
                <InvitationFacts
                    diagramName={inspection.diagramName}
                    expiresAt={inspection.expiresAt}
                    invitedBy={inspection.inviterDisplayName}
                    invitedEmail={invitedEmail}
                    roleLabel={roleLabel(inspection.role)}
                />
                <Button onClick={() => setPanel('register')}>
                    {t('diagram_invitation.create_account')}
                </Button>
                <Button variant="secondary" onClick={() => setPanel('login')}>
                    {t('diagram_invitation.sign_in')}
                </Button>
            </>
        );
    }

    if (!emailsMatch) {
        return shell(
            <>
                <p>
                    {t('diagram_invitation.wrong_account', {
                        invitedEmail,
                        currentEmail: user?.email ?? '',
                    })}
                </p>
                <Button
                    onClick={() => {
                        void logout();
                    }}
                >
                    {t('diagram_invitation.switch_account')}
                </Button>
            </>
        );
    }

    if (!isEmailVerified) {
        return shell(
            <>
                <h1 className="text-2xl font-semibold">
                    {t('auth.verify.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t('auth.verify.description')}
                </p>
                <p className="text-sm">{user?.email}</p>
                <Button
                    onClick={verification.resend}
                    disabled={
                        verification.isResending ||
                        verification.cooldownSeconds > 0
                    }
                >
                    {verification.isResending
                        ? t('auth.verify.sending')
                        : t('auth.verify.resend')}
                </Button>
                {verification.resendMessage === 'sent' ? (
                    <p className="text-sm">{t('auth.verify.sent')}</p>
                ) : null}
                {verification.resendMessage === 'failure' ? (
                    <p className="text-sm text-destructive">
                        {t('auth.verify.resend_failure')}
                    </p>
                ) : null}
                <Button
                    variant="secondary"
                    onClick={() => {
                        void logout();
                    }}
                >
                    {t('diagram_invitation.switch_account')}
                </Button>
            </>
        );
    }

    return shell(
        <>
            <h1 className="text-2xl font-semibold">
                {t('diagram_invitation.title')}
            </h1>
            <InvitationFacts
                diagramName={inspection.diagramName}
                expiresAt={inspection.expiresAt}
                invitedBy={inspection.inviterDisplayName}
                invitedEmail={invitedEmail}
                roleLabel={roleLabel(inspection.role)}
            />
            <Button onClick={() => void handleAccept()} disabled={isAccepting}>
                {isAccepting
                    ? t('diagram_invitation.accepting')
                    : t('diagram_invitation.accept')}
            </Button>
            <Button
                variant="secondary"
                onClick={() => {
                    void logout();
                }}
            >
                {t('diagram_invitation.switch_account')}
            </Button>
            {acceptError ? (
                <>
                    <p className="text-sm text-destructive">
                        {t('diagram_invitation.generic_error')}
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => void handleAccept()}
                    >
                        {t('diagram_invitation.retry')}
                    </Button>
                </>
            ) : null}
        </>
    );
};

const InvitationFacts: React.FC<{
    invitedBy: string;
    diagramName: string;
    roleLabel: string;
    invitedEmail: string;
    expiresAt: string;
}> = ({ invitedBy, diagramName, roleLabel, invitedEmail, expiresAt }) => {
    const { t } = useTranslation();
    const expiry = new Date(expiresAt);

    return (
        <dl className="flex flex-col gap-2 text-sm">
            <div>
                <dt className="text-muted-foreground">
                    {t('diagram_invitation.invited_by')}
                </dt>
                <dd>{invitedBy}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">
                    {t('diagram_invitation.diagram')}
                </dt>
                <dd>{diagramName}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">
                    {t('diagram_invitation.role')}
                </dt>
                <dd>{roleLabel}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">
                    {t('diagram_invitation.sent_to')}
                </dt>
                <dd>{invitedEmail}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">
                    {t('diagram_invitation.expires')}
                </dt>
                <dd>
                    {Number.isNaN(expiry.getTime())
                        ? expiresAt
                        : expiry.toLocaleString()}
                </dd>
            </div>
        </dl>
    );
};

export const InvitationPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <InvitationPageContent />
        </ThemeProvider>
    </LocalConfigProvider>
);
