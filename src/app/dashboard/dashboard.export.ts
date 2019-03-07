export class ExportService {
    private exportConfirmedItems: any[] = [];

    public exportData(data: any, ids: number[], meta: string[], activeFeatures: any[], filtersNotActive: boolean) {
        const head = ['ID']
        const keyListActiveFeatures = [];
        activeFeatures.forEach( feat => {
            if (feat.active) {
            head.push(data.schema.label[feat.property]);
            keyListActiveFeatures.push(feat.property);
            }
        });
        head.push('x');
        head.push('y');
        this.exportConfirmedItems.push(head);
        data.features.forEach(d => {
            if (ids.indexOf(d.id) > -1 || filtersNotActive) {
                const a = [];
                a.push(d.id);
                keyListActiveFeatures.forEach(key => {
                    if (key in d.values) {
                        a.push(d.values[key]);
                    } else {
                        a.push('undefined');
                    };
                });
                a.push(data.positions[data.features.indexOf(d)].position.x);
                a.push(data.positions[data.features.indexOf(d)].position.y);

                this.exportConfirmedItems.push(a);
            }
        });
        this.saveToFile(this.createCSVString(), meta);
    }

    private createCSVString(): string {
        let csv = '';
        this.exportConfirmedItems.forEach( d => {
            d.forEach( f => {
                csv = csv + f;
                if (d.indexOf(f) !== d.length - 1) {
                    csv = csv + ';';
                }
            });
            csv = csv + '\n'
        });

        return csv;
    }

    private saveToFile(data: string, meta: string[]) {
        let filename = meta[0].replace(new RegExp('\\.', 'g'), '')
            + '.' + meta[1].replace(new RegExp('\\.', 'g'), '')
            + '.' + meta[2].replace(new RegExp('\\.', 'g'), '');
        filename = filename.replace(/ /g, '_');
        const uri = 'data:text/csv;charset=utf-8,' + escape(data);

        const link = document.createElement('a');
        link.href = uri;
        link.download = filename + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
