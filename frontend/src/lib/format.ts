export function formatTimeLeft(totalSeconds: number): string[] {
    const SEC_PER_MIN = 60;
    const SEC_PER_HOUR = 60 * SEC_PER_MIN;
    const SEC_PER_DAY = 24 * SEC_PER_HOUR;
    const SEC_PER_MONTH = 30 * SEC_PER_DAY;
    const SEC_PER_YEAR = 12 * SEC_PER_MONTH;

    const y = Math.floor(totalSeconds / SEC_PER_YEAR);
    totalSeconds %= SEC_PER_YEAR;

    const mo = Math.floor(totalSeconds / SEC_PER_MONTH);
    totalSeconds %= SEC_PER_MONTH;

    const d = Math.floor(totalSeconds / SEC_PER_DAY);
    totalSeconds %= SEC_PER_DAY;

    const h = Math.floor(totalSeconds / SEC_PER_HOUR);
    totalSeconds %= SEC_PER_HOUR;

    const m = Math.floor(totalSeconds / SEC_PER_MIN);
    const s = totalSeconds % SEC_PER_MIN;

    const parts = [];
    if (y > 0) parts.push(`${y} ${plural(y, "year", "years")}`);
    if (mo > 0) parts.push(`${mo} ${plural(mo, "month", "months")}`);
    if (d > 0) parts.push(`${d} ${plural(d, "day", "days")}`);
    if (h > 0) parts.push(`${h} ${plural(h, "hour", "hours")}`);
    if (m > 0) parts.push(`${m} ${plural(m, "minute", "minutes")}`);
    if (s > 0 || parts.length === 0) parts.push(`${s} ${plural(s, "second", "seconds")}`);

    return parts;
}

function plural(n: number, singular: string, plural: string): string {
    return n === 1 ? singular : plural;
}