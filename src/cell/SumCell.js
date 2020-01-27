import BaseCell from "./BaseCell";
import Scope from "../Scope";
import {ValueType} from "exceljs";

export default class SumCell extends BaseCell {
    /**
     * @param {Scope} scope
     * @returns {SumCell}
     */
    apply(scope) {
        super.apply(scope);

        const target = SumCell._getTargetParam(scope);
        const __startOutput = scope.vm[target] && scope.vm[target].__startOutput;
        const __endOutput = scope.vm[target] && scope.vm[target].__endOutput;

        if (__startOutput && __endOutput) {
            const start = scope.output.worksheets[scope.outputCell.ws].getCell(__startOutput, scope.outputCell.c).address; //todo refactoring
            const end = scope.output.worksheets[scope.outputCell.ws].getCell(__endOutput, scope.outputCell.c).address; //todo refactoring

            scope.setCurrentOutputValue({formula: `sum(${start}:${end})`});
        }

        scope.incrementCol();

        return this;
    }

    /**
     * @param {Scope} scope
     * @returns {string}
     * @protected
     */
    static _getTargetParam(scope) {
        return scope.getCurrentTemplateValue().split(' ')[2];
    }

    /**
     * @param {Cell} cell
     * @returns {boolean}
     */
    static match(cell) {
        return cell && cell.type === ValueType.String && typeof cell.value === 'string' && cell.value.substring(0, 6) === '#! SUM';
    }
}