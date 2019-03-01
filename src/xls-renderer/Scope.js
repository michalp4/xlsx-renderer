export default class Scope {

    /**
     * @var {Workbook}
     */
    template;

    /**
     * @var {Workbook}
     */
    output;

    /**
     * @var {{}} view model
     */
    vm;

    /**
     * @var {{r:int, c:int}}
     */
    output_cell = Object.freeze({r: 1, c: 1, ws: 0});

    /**
     * @var {{r:int, c:int}}
     */
    template_cell = Object.freeze({r: 1, c: 1, ws: 0});

    /**
     * @var {Object.<string, Address>}
     */
    _masters = {};

    /**
     * @var {int}
     * @private
     */
    _frozen = 0;

    /**
     * @var {boolean}
     *
     * @private
     */
    _finished = false;

    /**
     * @param {Workbook} template
     * @param {Workbook} output
     *
     * @param {Object} vm
     */
    constructor(template, output, vm) {
        this.template = template;
        this.output = output;
        this.vm = vm;
    }

    /**
     * @returns {string|Object}
     */
    getCurrentTemplateValue() {
        return this.getCurrentTemplateCell().value;
    }

    /**
     * @returns {Cell}
     */
    getCurrentTemplateCell() {
        return this.template.worksheets[this.template_cell.ws].getCell(this.template_cell.r, this.template_cell.c);
    }

    /**
     * @param {?string|{formula:string}|{text:string,hyperlink:string}} value
     */
    setCurrentOutputValue(value) {
        if (!this._frozen) {
            // noinspection JSValidateTypes - todo exceljs invalid type definition todo
            this.output.worksheets[this.output_cell.ws].getCell(this.output_cell.r, this.output_cell.c).value = value;
        }
    }

    applyStyles() {
        if (!this._frozen) {
            const ct = this.template_cell;
            const wst = this.template.worksheets[ct.ws];

            const co = this.output_cell;
            const wso = this.output.worksheets[co.ws]; //todo refactoring

            wso.getRow(co.r).height = wst.getRow(ct.r).height;
            wso.getCell(co.r, co.c).style = wst.getCell(ct.r, ct.c).style;

            if (wst.getColumn(ct.c).isCustomWidth) {
                wso.getColumn(co.c).width = wst.getColumn(ct.c).width;
            }
        }
    }

    applyMerge() {
        const tws = this.template.worksheets[this.template_cell.ws];
        const tc = tws.getCell(this.template_cell.r, this.template_cell.c);

        const ows = this.output.worksheets[this.output_cell.ws];
        const current = ows.getCell(this.output_cell.r, this.output_cell.c).model.address;

        if (tc.model.master && tc.model.master !== tc.model.address) {
            const range = `${this._masters[tc.model.master] || tc.model.master}:${current}`;

            ows.unMergeCells(range);
            ows.mergeCells(range);
        } else if (tc.isMerged) {
            this._masters[tc.model.address] = current;
        }
    }

    incrementCol() {
        if (!this._finished) {
            this.template_cell = Object.freeze({...this.template_cell, c: this.template_cell.c + 1});
        }

        this.output_cell = Object.freeze({...this.output_cell, c: this.output_cell.c + 1});
    }

    incrementRow() {
        if (!this._finished) {
            this.template_cell = Object.freeze({...this.template_cell, r: this.template_cell.r + 1, c: 1});
        }

        if (this._frozen) {
            this.output.worksheets[this.output_cell.ws].spliceRows(this.output_cell.r + 1, 1); //todo refactoring
            this.output_cell = Object.freeze({...this.output_cell, c: 1})
        } else {
            this.output_cell = Object.freeze({...this.output_cell, r: this.output_cell.r + 1, c: 1})
        }
    }

    freezeOutput() {
        this._frozen++;
    }

    unfreezeOutput() {
        this._frozen = Math.max(this._frozen - 1, 0);
    }

    /**
     * @returns {boolean}
     */
    isFrozen() {
        return this._frozen > 0;
    }

    finish() {
        this._finished = true;
        this.unfreezeOutput();
    }

    isFinished() {
        return this._finished;
    }

}
