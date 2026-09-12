export const escapePrismaStringLiteral = (value: string): string => {
    let escaped = '';

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        switch (char) {
            case '\\':
                escaped += '\\\\';
                break;
            case '"':
                escaped += '\\"';
                break;
            case '\n':
                escaped += '\\n';
                break;
            case '\r':
                escaped += '\\r';
                break;
            case '\t':
                escaped += '\\t';
                break;
            default:
                escaped += char;
        }
    }

    return `"${escaped}"`;
};

export const escapePrismaComment = (value: string): string =>
    value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ');
