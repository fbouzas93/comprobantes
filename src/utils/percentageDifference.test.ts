import { percentageDifference } from "./percentageDifference";

describe('percentageDifference', () => {

    it('should return positive percentage when number2 is greater than number1', () => {
        expect(percentageDifference(100, 120)).toBe(18.18);
    });

    it('should return negative percentage when number2 is less than number1', () => {
        expect(percentageDifference(120, 100)).toBe(-18.18);
    });

    it('should return 0 when number1 equals number2', () => {
        expect(percentageDifference(50, 50)).toBe(0.00);
    });

    it('should return 0 when both number1 and number2 are 0', () => {
        expect(percentageDifference(0, 0)).toBe(0.00);
    });
});
