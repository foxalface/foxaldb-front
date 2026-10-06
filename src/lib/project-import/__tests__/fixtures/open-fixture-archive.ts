import { ArchiveReader } from '../../archive/archive-reader';
import type { ArchiveLimits } from '../../archive/archive-limits';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';

/** Test input taken from the explicit local safety ceiling, not a second authority. */
export const fixtureArchiveLimits: ArchiveLimits =
    CONSERVATIVE_UPLOAD_SAFETY_CEILING.archive;

export const openFixtureArchive = (file: File): Promise<ArchiveReader> =>
    ArchiveReader.open(file, fixtureArchiveLimits);
