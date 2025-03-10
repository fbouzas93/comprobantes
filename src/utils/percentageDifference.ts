export function percentageDifference(number1: number, number2: number) {
    const denominator = (number1 + number2) / 2;
    
    if (denominator === 0) return 0;

    const percentage = 100 * ((number2 - number1) / denominator);

    return parseFloat(percentage.toFixed(2));
}
