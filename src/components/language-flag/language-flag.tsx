import React from 'react';
import {
    FlagBd,
    FlagBr,
    FlagCn,
    FlagDe,
    FlagEs,
    FlagFr,
    FlagHr,
    FlagId,
    FlagIn,
    FlagJp,
    FlagKr,
    FlagNp,
    FlagRu,
    FlagSa,
    FlagTr,
    FlagTw,
    FlagUa,
    FlagUs,
    FlagVn,
    type FlagComponent,
} from '@sankyu/react-circle-flags';
import { cn } from '@/lib/utils';
import type { LanguageCountryCode } from '@/i18n/types';

const FLAG_COMPONENTS: Record<LanguageCountryCode, FlagComponent> = {
    bd: FlagBd,
    br: FlagBr,
    cn: FlagCn,
    de: FlagDe,
    es: FlagEs,
    fr: FlagFr,
    hr: FlagHr,
    id: FlagId,
    in: FlagIn,
    jp: FlagJp,
    kr: FlagKr,
    np: FlagNp,
    ru: FlagRu,
    sa: FlagSa,
    tr: FlagTr,
    tw: FlagTw,
    ua: FlagUa,
    us: FlagUs,
    vn: FlagVn,
};

export interface LanguageFlagProps {
    countryCode: LanguageCountryCode;
    className?: string;
    size?: number;
}

export const LanguageFlag: React.FC<LanguageFlagProps> = ({
    countryCode,
    className,
    size = 16,
}) => {
    const Flag = FLAG_COMPONENTS[countryCode];

    return (
        <Flag
            width={size}
            height={size}
            aria-hidden
            className={cn('shrink-0', className)}
        />
    );
};
