import React, { useMemo, useState } from 'react';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import {
    databaseClientToLabelMap,
    databaseEditionToClientsMap,
    databaseTypeToClientsMap,
    type DatabaseClient,
} from '@/lib/domain/database-clients';
import { minimizeQuery } from '@/lib/data/import-metadata/utils';
import { useTranslation } from 'react-i18next';
import { DatabaseType as DatabaseTypeEnum } from '@/lib/domain/database-type';
import { SSMSInfo } from './ssms-info';
import { getMetadataQuery } from './get-metadata-query';

export interface MetadataQueryInstructionsProps {
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    showSSMSInfoDialog: boolean;
    setShowSSMSInfoDialog: (show: boolean) => void;
}

export const MetadataQueryInstructions: React.FC<
    MetadataQueryInstructionsProps
> = ({
    databaseType,
    databaseEdition,
    showSSMSInfoDialog,
    setShowSSMSInfoDialog,
}) => {
    const { t } = useTranslation();
    const databaseClients = useMemo(
        () => [
            ...databaseTypeToClientsMap[databaseType],
            ...(databaseEdition
                ? databaseEditionToClientsMap[databaseEdition]
                : []),
        ],
        [databaseType, databaseEdition]
    );
    const [databaseClient, setDatabaseClient] = useState<
        DatabaseClient | undefined
    >();

    const code = useMemo(
        () =>
            getMetadataQuery({
                databaseType,
                databaseEdition,
                databaseClient,
            }),
        [databaseType, databaseEdition, databaseClient]
    );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                    {t('new_diagram_dialog.import_from_database.run_query')}
                </p>
                {databaseType === DatabaseTypeEnum.SQL_SERVER ? (
                    <SSMSInfo
                        open={showSSMSInfoDialog}
                        setOpen={setShowSSMSInfoDialog}
                    />
                ) : null}
            </div>
            {databaseClients.length > 0 ? (
                <Tabs
                    value={!databaseClient ? 'sql' : databaseClient}
                    onValueChange={(value) => {
                        setDatabaseClient(
                            value === 'sql'
                                ? undefined
                                : (value as DatabaseClient)
                        );
                    }}
                >
                    <TabsList className="h-8 justify-start rounded-none rounded-t-sm">
                        <TabsTrigger value="sql" className="h-6 w-20">
                            {t(
                                'new_diagram_dialog.import_from_database.client_sql'
                            )}
                        </TabsTrigger>
                        {databaseClients.map((client) => (
                            <TabsTrigger
                                key={client}
                                value={client}
                                className="h-6 !w-20"
                            >
                                {databaseClientToLabelMap[client]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <CodeSnippet
                        className="h-40 w-full md:h-[200px]"
                        code={minimizeQuery(code)}
                        codeToCopy={code}
                        language={databaseClient ? 'shell' : 'sql'}
                    />
                </Tabs>
            ) : (
                <CodeSnippet
                    className="h-40 w-full md:h-[200px]"
                    code={minimizeQuery(code)}
                    codeToCopy={code}
                    language="sql"
                />
            )}
        </div>
    );
};
