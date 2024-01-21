export default class CodeWriter {

    public indentSize: number = 4;

    public indentChar: string = ' ';

    private code: string[] = [];

    private currentLine: string = '';

    private indentation: number = 0;

    public write(value: string): void {
        if (!value || value.length === 0) {
            return;
        }
        if (this.currentLine === '') {
            this.currentLine = this.indentChar.repeat(this.indentation);
        }
        this.currentLine += value;
    }

    public writeLine(value: string = ''): void {
        let empty = !value || value.length === 0;
        if (this.currentLine === '' && !empty) {
            this.currentLine = this.indentChar.repeat(this.indentation);
        }
        this.currentLine += value;
        this.code.push(this.currentLine);
        this.currentLine = '';
    }

    public writeLineThenIndent(value: string = ''): void {
        this.writeLine(value);
        this.indent();
    }

    public writeLineThenUnindent(value: string = ''): void {
        this.writeLine(value);
        this.unindent();
    }

    public indent(): void {
        this.indentation += this.indentSize;
    }

    public unindent(): void {
        this.indentation -= this.indentSize;
        if (this.indentation < 0) {
            this.indentation = 0;
        }
    }

    public toString(): string {
        return this.code.join('\n');
    }

}